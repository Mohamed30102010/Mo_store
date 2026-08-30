"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, createSession } from "@/lib/auth";
import { createOrder, type NewOrderItem } from "@/lib/orders";
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

/** إثبات الدفع بيتخزن في Vercel Blob بدل القرص المحلي — persistent عبر deployments/invocations */
async function saveProof(file: File): Promise<string> {
  return saveImage(file, "payment-proofs", MAX_PROOF_BYTES);
}

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // 1) بيانات العميل
  const name = cleanStr(formData.get("customerName"), 80);
  const phone = cleanStr(formData.get("customerPhone"), 20);
  const email = cleanStr(formData.get("customerEmail"), 120).toLowerCase();
  const address = cleanStr(formData.get("address"), 300);
  const note = cleanStr(formData.get("note"), 500);
  const paymentMethod = cleanStr(formData.get("paymentMethod"), 20);
  const wantAccount = formData.get("createAccount") === "on";
  const password =
    typeof formData.get("password") === "string"
      ? (formData.get("password") as string)
      : "";

  if (name.length < 2) return { error: "اكتب اسمك بشكل صحيح." };
  if (!isValidPhone(phone)) return { error: "رقم الموبايل غير صحيح." };
  if (email && !isValidEmail(email)) return { error: "الإيميل غير صحيح." };
  if (paymentMethod !== "cash" && paymentMethod !== "transfer")
    return { error: "اختار طريقة دفع." };

  // 2) السلة — نتحقّق من الأسعار من قاعدة البيانات (مش من العميل)
  const lines = parseCart(cleanStr(formData.get("items"), 20000));
  if (lines.length === 0) return { error: "سلتك فاضية." };

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: NewOrderItem[] = [];
  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p) continue; // منتج غير موجود/غير متاح — نتجاهله
    items.push({
      productId: p.id,
      name: p.name,
      priceCents: p.priceCents, // السعر من الـ DB
      qty: line.qty,
      type: p.type,
    });
  }
  if (items.length === 0)
    return { error: "المنتجات في سلتك مش متاحة حالياً." };

  // ═══ العرض الإضافي (Order Bump) — السعر من إعدادات السيرفر، مش من العميل ═══
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

  // 3) المستخدم: مسجّل / حساب جديد / زائر
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

  // 4) إثبات الدفع (مطلوب للتحويل)
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

  // 5) إنشاء الطلب — الشحن بيتحسب على السيرفر من إعدادات site.ts (مش من العميل)
  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0);
  const shippingCents = shippingCostCents(subtotalCents, hasPhysical);

  let order;
  try {
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
  } catch (e) {
    // فشل إنشاء الطلب بعد نجاح رفع إثبات الدفع على Blob — نمسح الملف اليتيم
    // (Phase 1/2: لا نسيب Blob بدون database reference، ولا database reference بدون Blob)
    if (proofImage) await deleteBlobIfOwned(proofImage);
    return {
      error: e instanceof Error ? e.message : "حصل خطأ أثناء إنشاء الطلب. حاول تاني.",
    };
  }

  return { ok: true, orderNumber: order.orderNumber };
}
