import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * إعدادات المتجر المخزنة في قاعدة البيانات (مفتاح/قيمة).
 * كل المفاتيح المعروفة معرّفة هنا عشان تبقى في مكان واحد.
 */
export const SETTING_KEYS = [
  // ═══ البكسلات / التتبّع ═══
  "meta_pixel_id",
  "meta_pixel_enabled",
  "tiktok_pixel_id",
  "tiktok_pixel_enabled",
  "ga_measurement_id",
  "ga_enabled",
  "snap_pixel_id",
  "snap_pixel_enabled",
  // ═══ العرض الإضافي (Order Bump) ═══
  "bump_enabled",
  "bump_product_id",
  "bump_price", // السعر الخاص بالعرض بالجنيه (نص)
  "bump_headline",
  "bump_desc",
  // ═══ نقاط المكافآت (Rewards/Points) ═══
  "reward_percent", // نسبة المكافآت % من قيمة المنتجات المؤهّلة — افتراضي 30
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

/** كل الإعدادات كخريطة { key: value } — القيم الناقصة بترجع "" */
export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<SettingKey, string>;
  for (const k of SETTING_KEYS) out[k] = map[k] ?? "";
  return out;
}

/** حفظ مجموعة إعدادات دفعة واحدة (upsert لكل مفتاح) */
export async function saveSettings(
  values: Partial<Record<SettingKey, string>>
): Promise<void> {
  const ops = Object.entries(values)
    .filter(([k]) => (SETTING_KEYS as readonly string[]).includes(k))
    .map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value ?? "" },
        create: { key, value: value ?? "" },
      })
    );
  await prisma.$transaction(ops);
}

/** هل الإعداد مفعّل؟ ("1" = مفعّل) */
export function isOn(value: string | undefined): boolean {
  return value === "1";
}

// ═══ إعدادات التتبّع الجاهزة للحقن في الواجهة ═══
export type PixelConfig = {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  gaMeasurementId: string | null;
  snapPixelId: string | null;
};

/** البكسلات المفعّلة فقط (ومعاها ID فعلاً) — دي اللي بتتحقن في الصفحات */
export async function getActivePixels(): Promise<PixelConfig> {
  const s = await getSettings();
  return {
    metaPixelId:
      isOn(s.meta_pixel_enabled) && s.meta_pixel_id.trim() ? s.meta_pixel_id.trim() : null,
    tiktokPixelId:
      isOn(s.tiktok_pixel_enabled) && s.tiktok_pixel_id.trim() ? s.tiktok_pixel_id.trim() : null,
    gaMeasurementId: isOn(s.ga_enabled) && s.ga_measurement_id.trim() ? s.ga_measurement_id.trim() : null,
    snapPixelId:
      isOn(s.snap_pixel_enabled) && s.snap_pixel_id.trim() ? s.snap_pixel_id.trim() : null,
  };
}

// ═══ العرض الإضافي (Order Bump) ═══
export type BumpOffer = {
  productId: string;
  name: string;
  image: string;
  type: string;
  originalCents: number;
  bumpCents: number;
  headline: string;
  desc: string;
};

/** عرض الـ bump الجاهز للعرض في الشيك أوت — null لو مش مفعّل/غير صالح */
export async function getBumpOffer(): Promise<BumpOffer | null> {
  const s = await getSettings();
  if (!isOn(s.bump_enabled) || !s.bump_product_id) return null;

  const product = await prisma.product.findFirst({
    where: { id: s.bump_product_id, active: true },
  });
  if (!product) return null;

  const bumpEgp = Number(s.bump_price.replace(/,/g, ""));
  const bumpCents =
    Number.isFinite(bumpEgp) && bumpEgp > 0
      ? Math.round(bumpEgp * 100)
      : product.priceCents; // لو مفيش سعر خاص → السعر العادي

  let image = "";
  try {
    const imgs = JSON.parse(product.images);
    image = Array.isArray(imgs) && imgs[0] ? imgs[0] : "";
  } catch {}

  return {
    productId: product.id,
    name: product.name,
    image,
    type: product.type,
    originalCents: product.priceCents,
    bumpCents,
    headline: s.bump_headline.trim() || "أضف العرض ده لطلبك 🎁",
    desc: s.bump_desc.trim() || "",
  };
}
