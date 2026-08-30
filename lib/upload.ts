import "server-only";
import { put, del } from "@vercel/blob";

/**
 * موديل الأمان بتاع الملفات (Phase 4):
 * - صور المنتجات: عامة وبتتعرض للكل مباشرة عبر رابط الـ Blob (طبيعي، ده الغرض منها).
 * - إثباتات الدفع: بترفع بنفس آلية Vercel Blob (اللي بيدعم access: "public" بس فعليًا
 *   في الـ API الحالي)، لكن رابط الـ Blob بتاعها ميتخزّنش ولا يتعرضش للمتصفح أبدًا —
 *   بيتخزّن في PostgreSQL بس، والوصول ليها بيتم حصريًا عبر
 *   /api/payment-proof/[orderId] اللي بيتحقق من الصلاحية سيرفر-ساید قبل أي عرض
 *   (صاحب الطلب أو أدمن بس). كده الحماية الفعلية مش "إخفاء الرابط في الواجهة"
 *   لوحدها، وإنما تحقق صلاحيات حقيقي على السيرفر.
 */

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX = 5 * 1024 * 1024; // 5MB

export type UploadedImage = {
  url: string;
  pathname: string;
};

/** يتحقق من الملف ويرفعه على Vercel Blob، ويرجّع تفاصيله الكاملة (رابط + مسار) */
export async function uploadImage(
  file: File,
  subdir: string,
  maxBytes = DEFAULT_MAX
): Promise<UploadedImage> {
  if (!ALLOWED_IMAGE.includes(file.type)) {
    throw new Error("الصورة لازم تكون JPG أو PNG أو WEBP.");
  }
  if (file.size > maxBytes) {
    throw new Error("حجم الصورة كبير (الحد الأقصى 5 ميجا).");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "تخزين الصور (Vercel Blob) لسه مش متظبط على السيرفر — راجع متغير BLOB_READ_WRITE_TOKEN."
    );
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const rand = Array.from({ length: 20 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
  // اسم/مسار عشوائي فريد — مايعتمدش على اسم الملف الأصلي (تفادي تصادم/مسارات خطرة)
  const pathname = `${subdir}/${Date.now()}-${rand}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return { url: blob.url, pathname: blob.pathname };
}

/** نسخة مبسّطة بترجّع الرابط بس — للتوافق مع الاستخدام الحالي في باقي المشروع */
export async function saveImage(
  file: File,
  subdir: string,
  maxBytes = DEFAULT_MAX
): Promise<string> {
  const { url } = await uploadImage(file, subdir, maxBytes);
  return url;
}

/**
 * يمسح ملف من Vercel Blob لو الرابط ده فعلاً بتاعنا (مش رابط خارجي حطّه الأدمن يدويًا).
 * بيتجاهل أي خطأ عشان فشل المسح ميوقفش العملية الأساسية (تحديث/حذف المنتج اتنفذ بالفعل).
 */
export async function deleteBlobIfOwned(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return;
    await del(url);
  } catch {
    // متعمّد — تجاهل فشل المسح
  }
}
