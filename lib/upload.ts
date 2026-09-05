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

const DEFAULT_MAX = 5 * 1024 * 1024; // 5MB

// خريطة الامتدادات الشائعة — تُستخدم لو النوع مش معروف بدقة (fallback: bin)
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/avif": "avif",
  "image/x-icon": "ico",
  "image/heic": "heic",
  "image/heif": "heif",
};

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
  // نقبل أي نوع صورة (image/*) — بدل قايمة محدودة سابقًا
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    throw new Error("الملف ده مش صورة صالحة.");
  }
  if (file.size > maxBytes) {
    throw new Error("حجم الصورة كبير (الحد الأقصى 5 ميجا).");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "تخزين الصور (Vercel Blob) لسه مش متظبط على السيرفر — راجع متغير BLOB_READ_WRITE_TOKEN."
    );
  }

  // نحدد الامتداد من نوع الملف لو معروف، وإلا ناخده من اسم الملف الأصلي، وإلا "img" افتراضيًا
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const ext = EXT_BY_MIME[file.type] || fromName || "img";

  const rand = Array.from({ length: 20 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
  // اسم/مسار عشوائي فريد — مايعتمدش على اسم الملف الأصلي (تفادي تصادم/مسارات خطرة)
  const pathname = `${subdir}/${Date.now()}-${rand}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || "application/octet-stream",
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
