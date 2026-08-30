"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSettings, type SettingKey } from "@/lib/settings";
import { isValidRewardPercent } from "@/lib/rewards";
import { cleanStr } from "@/lib/validation";

export type SettingsFormState = { error?: string; ok?: boolean };

/** توجّل (checkbox) → "1" / "" */
function toggle(formData: FormData, name: string): string {
  return formData.get(name) === "on" ? "1" : "";
}

export async function saveSettingsAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireAdmin();

  // ═══ نقاط المكافآت: تحقق من النسبة قبل الحفظ ═══
  const rewardPercentRaw = cleanStr(formData.get("reward_percent"), 10);
  const rewardPercent = Number(rewardPercentRaw);
  if (!isValidRewardPercent(rewardPercent)) {
    return { error: "نسبة المكافآت لازم تكون رقم بين 0 و 100." };
  }

  // ═══ العرض الإضافي: تحقق من المنتج والسعر قبل الحفظ ═══
  const bumpEnabled = toggle(formData, "bump_enabled");
  const bumpProductId = cleanStr(formData.get("bump_product_id"), 40);
  const bumpPrice = cleanStr(formData.get("bump_price"), 20);

  if (bumpEnabled) {
    if (!bumpProductId)
      return { error: "اختار منتج العرض الإضافي الأول." };
    const product = await prisma.product.findFirst({
      where: { id: bumpProductId, active: true },
    });
    if (!product)
      return { error: "منتج العرض الإضافي مش موجود أو غير مفعّل." };
    if (bumpPrice) {
      const n = Number(bumpPrice.replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0)
        return { error: "سعر العرض الإضافي غير صحيح." };
      if (Math.round(n * 100) >= product.priceCents)
        return { error: "سعر العرض لازم يكون أقل من سعر المنتج الأصلي عشان يبقى عرض فعلاً." };
    }
  }

  const values: Partial<Record<SettingKey, string>> = {
    // البكسلات
    meta_pixel_id: cleanStr(formData.get("meta_pixel_id"), 40),
    meta_pixel_enabled: toggle(formData, "meta_pixel_enabled"),
    tiktok_pixel_id: cleanStr(formData.get("tiktok_pixel_id"), 40),
    tiktok_pixel_enabled: toggle(formData, "tiktok_pixel_enabled"),
    ga_measurement_id: cleanStr(formData.get("ga_measurement_id"), 40),
    ga_enabled: toggle(formData, "ga_enabled"),
    snap_pixel_id: cleanStr(formData.get("snap_pixel_id"), 60),
    snap_pixel_enabled: toggle(formData, "snap_pixel_enabled"),
    // العرض الإضافي
    bump_enabled: bumpEnabled,
    bump_product_id: bumpProductId,
    bump_price: bumpPrice,
    bump_headline: cleanStr(formData.get("bump_headline"), 120),
    bump_desc: cleanStr(formData.get("bump_desc"), 300),
    // نقاط المكافآت
    reward_percent: String(rewardPercent),
  };

  await saveSettings(values);

  // الحقن بيحصل في الـ layout — نجدد كل الصفحات
  revalidatePath("/", "layout");

  return { ok: true };
}
