"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { saveImage, deleteBlobIfOwned } from "@/lib/upload";
import { updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { awardOrderPoints, reverseOrderPoints, adjustPoints } from "@/lib/rewards";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  isSlugTaken,
  type ProductInput,
} from "@/lib/products";
import { cleanStr, isNonEmpty } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { PRODUCT_REQUEST_STATUSES, type ProductRequestStatus } from "@/lib/product-requests";

// ===== طلبات "اطلب منتج" =====
export async function setProductRequestStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanStr(formData.get("id"), 40);
  const status = cleanStr(formData.get("status"), 20);
  if (!id || !PRODUCT_REQUEST_STATUSES.includes(status as ProductRequestStatus)) return;

  await prisma.productRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/requests");
}
// ===== الطلبات =====
export async function setOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanStr(formData.get("orderId"), 40);
  const status = cleanStr(formData.get("status"), 20);
  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) return;
  await updateOrderStatus(id, status as OrderStatus);

  // نقاط المكافآت: تُمنح فقط عند "delivered"، وترجع لو الطلب اتلغى أو رجع بعدها (Phase 35/37)
  if (status === "delivered") {
    await awardOrderPoints(id);
  } else if (status === "cancelled" || status === "returned") {
    await reverseOrderPoints(id);
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// ===== المنتجات =====
export type ProductFormState = { error?: string };

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-") // أي رمز غير حرف/رقم → شرطة
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function egpToCents(v: string): number | null {
  const n = Number(v.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

async function parseProductForm(
  formData: FormData,
  exceptId?: string
): Promise<{ data?: ProductInput; error?: string; uploadedImageUrl?: string }> {
  const name = cleanStr(formData.get("name"), 120);
  if (!isNonEmpty(name, 2)) return { error: "اكتب اسم المنتج." };

  let slug = cleanStr(formData.get("slug"), 80);
  if (!slug) slug = slugify(name);
  else slug = slugify(slug);
  if (!slug) return { error: "الـ slug غير صالح، جرّب اسم تاني." };
  if (await isSlugTaken(slug, exceptId))
    return { error: `الـ slug "${slug}" مستخدم بالفعل، غيّره.` };

  const priceCents = egpToCents(cleanStr(formData.get("price"), 20));
  if (priceCents === null) return { error: "السعر غير صحيح." };

  const compareRaw = cleanStr(formData.get("compareAt"), 20);
  const compareAtCents = compareRaw ? egpToCents(compareRaw) : null;
  if (compareRaw && compareAtCents === null)
    return { error: "السعر قبل الخصم غير صحيح." };
  const pricePointsRaw = cleanStr(formData.get("pricePoints"), 20);
  let pricePoints: number | null = null;
  if (pricePointsRaw) {
    const parsed = Math.round(Number(pricePointsRaw));
    if (!Number.isFinite(parsed) || parsed < 0)
      return { error: "السعر بالنقاط غير صحيح." };
    pricePoints = parsed;
  }

  const type = cleanStr(formData.get("type"), 20) === "digital" ? "digital" : "physical";
  const shortDesc = cleanStr(formData.get("shortDesc"), 160) || null;
  const description = cleanStr(formData.get("description"), 4000);
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";

  // الصور: رابط لكل سطر + صورة مرفوعة (اختياري)
  const urls = cleanStr(formData.get("imageUrls"), 4000)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  // تحقّق من صحة الروابط اليدوية قبل أي رفع فعلي — نتجنّب رفع صورة على Blob
  // عشان بس نكتشف بعدين إن رابط تاني في نفس الفورم غير صالح (Phase 6: broken URLs)
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    } catch {
      return { error: `الرابط ده مش صالح: ${u}` };
    }
  }

  const images: string[] = [];
  let uploadedImageUrl: string | undefined;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      uploadedImageUrl = await saveImage(file, "products");
    } catch (e) {
      return { error: e instanceof Error ? e.message : "فشل رفع الصورة." };
    }
    images.push(uploadedImageUrl);
  }
  images.push(...urls);

  // إزالة أي تكرار (نفس الرابط اتكتب أو اترفع أكتر من مرة) — Phase 6: duplicate references
  const uniqueImages = Array.from(new Set(images));

  return {
    data: {
      slug,
      name,
      shortDesc,
      description,
      priceCents,
      compareAtCents,
      pricePoints,
      type,
      images: uniqueImages,
      featured,
      active,
    },
    uploadedImageUrl,
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const { data, error, uploadedImageUrl } = await parseProductForm(formData);
  if (error || !data) return { error };

  try {
    await createProduct(data);
  } catch (e) {
    // فشل حفظ المنتج بعد نجاح رفع الصورة على Blob — نمسح الملف اليتيم بدل ما نسيبه معلّق
    // (Phase 1: لا ننشئ أي database reference غير صالح، ولا نسيب Blob بدون مرجع)
    if (uploadedImageUrl) await deleteBlobIfOwned(uploadedImageUrl);
    return { error: e instanceof Error ? e.message : "فشل حفظ المنتج." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = cleanStr(formData.get("id"), 40);
  if (!id) return { error: "منتج غير معروف." };
  const { data, error, uploadedImageUrl } = await parseProductForm(formData, id);
  if (error || !data) return { error };

  try {
    await updateProduct(id, data);
  } catch (e) {
    // نفس المبدأ: صورة جديدة اترفعت بنجاح لكن التحديث فشل — الصورة الجديدة يتيمة، نمسحها
    if (uploadedImageUrl) await deleteBlobIfOwned(uploadedImageUrl);
    return { error: e instanceof Error ? e.message : "فشل تحديث المنتج." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = cleanStr(formData.get("id"), 40);
  if (id) {
    await deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/");
  }
}

// ===== نقاط المكافآت: تعديل يدوي من الأدمن =====
export type PointsAdjustFormState = { error?: string; ok?: boolean };

export async function adjustPointsAction(
  _prev: PointsAdjustFormState,
  formData: FormData
): Promise<PointsAdjustFormState> {
  const admin = await requireAdmin();
  const userId = cleanStr(formData.get("userId"), 40);
  const amountRaw = cleanStr(formData.get("amount"), 20);
  const reason = cleanStr(formData.get("reason"), 300);

  if (!userId) return { error: "اختار العميل." };
  const amount = Math.round(Number(amountRaw));
  if (!Number.isFinite(amount) || amount === 0)
    return { error: "اكتب قيمة تعديل صحيحة (رقم موجب للإضافة أو سالب للخصم)." };
  if (!isNonEmpty(reason, 3)) return { error: "اكتب سبب التعديل." };

  try {
    await adjustPoints(userId, amount, reason, admin.email);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "فشل تعديل النقاط." };
  }

  revalidatePath("/admin/rewards");
  return { ok: true };
                                }
