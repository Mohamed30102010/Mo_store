"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, createSession } from "@/lib/auth";
import { createOrder, type NewOrderItem } from "@/lib/orders";
import { redeemCouponInTransaction } from "@/lib/coupons";
import { createNotification } from "@/lib/notifications";
import { getBumpOffer } from "@/lib/settings";
import { shippingCostCents } from "@/lib/site";
import { isValidEmail, isValidPhone, cleanStr } from "@/lib/validation";
import { saveImage, deleteBlobIfOwned } from "@/lib/upload";

export type CheckoutState = {
  error?: string;
  ok?: boolean;
  orderNumber?: string;
};

const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5MB

type CartLine = { productId: string; qty: number };

function parseCart(raw: string): CartLine[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => ({
        productId: typeof x?.productId === "string" ? x.productId : "",
        qty: Math.floor(Number(x?.qty)),
      }))
      .filter((x) => x.productId && Number.isFinite(x.qty) && x.qty > 0 && x.qty <= 999);
  } catch {
    return [];
  }
}

async function saveProof(file: File): Promise<string> {
  return saveImage(file, "payment-proofs", MAX_PROOF_BYTES);
}

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const name = cleanStr(formData.get("customerName"), 80);
  const phone = cleanStr(formData.get("customerPhone"), 20);
  const email = cleanStr(formData.get("customerEmail"), 120).toLowerCase();
  const address = cleanStr(formData.get("address"), 300);
  const note = cleanStr(formData.get("note"), 500);
  const paymentMethod = cleanStr(formData.get("paymentMethod"), 20);
  const wantAccount = formData.get("createAccount") === "on";
  const couponCodeRaw = cleanStr(formData.get("couponCode"), 40);
  const password =
    typeof formData.get("password") === "string"
      ? (formData.get("password") as string)
      : "";

  if (name.length < 2) return { error: "اكتب اسمك بشكل صحيح." };
  if (!isValidPhone(phone)) return { error: "رقم الموبايل غير صحيح." };
  if (email && !isValidEmail(email)) return { error: "الإيميل غير صحيح." };
  if (paymentMethod !== "cash" && paymentMethod !== "transfer")
    return { error: "اختار طريقة دفع." };

  const lines = parseCart(cleanStr(formData.get("items"), 20000));
  if (lines.length === 0) return { error: "سلتك فاضية." };

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: NewOrderItem[] = [];
  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p) continue;
    items.push({
      productId: p.id,
      name: p.name,
      priceCents: p.priceCents,
      qty: line.qty,
      type: p.type,
    });
  }
  if (items.length === 0)
    return { error: "المنتجات في سلتك مش متاحة حالياً." };

  if (formData.get("bump") === "1") {
    const bump = await getBumpOffer();
    const alreadyInCart = bump && items.some((i) => i.productId === bump.productId);
    if (bump && !alreadyInCart) {
      items.push({
        productId: bump.productId,
        name: bump.name + " (عرض إضافي)",
        priceCents: bump.bumpCents,
        qty: 1,
        type: bump.type,
      });
    }
  }

  const hasPhysical = items.some((i) => i.type === "physical");
  if (hasPhysical && address.length < 5)
    return { error: "اكتب عنوان التوصيل للمنتجات الملموسة." };

  const current = await getCurrentUser();
  let userId: string | null = current?.id ?? null;

  if (!current && wantAccount) {
    if (!isValidEmail(email))
      return { error: "لإنشاء حساب لازم إيميل صحيح." };
    if (password.length < 6)
      return { error: "كلمة سر الحساب لازم 6 حروف على الأقل." };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return { error: "فيه حساب بالإيميل ده. سجّل دخول الأول أو اشترِ كزائر." };
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: await hashPassword(password),
        role: "customer",
      },
    });
    await createSession(user.id);
    userId = user.id;
  }

  let proofImage: string | null = null;
  const proof = formData.get("proof");
  if (paymentMethod === "transfer") {
    if (!(proof instanceof File) || proof.size === 0) {
      return { error: "ارفع صورة إثبات التحويل." };
    }
    try {
      proofImage = await saveProof(proof);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "فشل رفع الصورة." };
    }
  }

  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const shippingCents = shippingCostCents(subtotalCents, hasPhysical);

  let order;
  try {
    if (couponCodeRaw) {
      order = await prisma.$transaction(async (tx) => {
        const { discountPercent, code } = await redeemCouponInTransaction(
          tx,
          couponCodeRaw,
          phone
        );
        const discountCents = Math.round((subtotalCents * discountPercent) / 100);
        return createOrder(
          {
            userId,
            customerName: name,
            customerPhone: phone,
            customerEmail: email || current?.email || null,
            address: address || null,
            paymentMethod,
            proofImage,
            note: note || null,
            shippingCents,
            items,
            couponCode: code,
            discountCents,
          },
          tx
        );
      });

      // الإشعار بعد نجاح المعاملة بالكامل — مش هيتسجّل لو المعاملة فشلت وترجعت
      await createNotification(
        "order",
        "طلب جديد 🧾",
        `طلب جديد من ${name} — رقم الطلب ${order.orderNumber} (كوبون مُطبّق)`,
        `/admin/orders/${order.id}`
      );
    } else {
      order = await createOrder({
        userId,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || current?.email || null,
        address: address || null,
        paymentMethod,
        proofImage,
        note: note || null,
        shippingCents,
        items,
      });
    }
  } catch (e) {
    if (proofImage) await deleteBlobIfOwned(proofImage);
    return {
      error: e instanceof Error ? e.message : "حصل خطأ أثناء إنشاء الطلب. حاول تاني.",
    };
  }

  return { ok: true, orderNumber: order.orderNumber };
}
