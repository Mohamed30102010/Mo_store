import "server-only";
import { prisma } from "@/lib/prisma";

export type CouponCheckResult =
  | { valid: true; discountPercent: number }
  | { valid: false; error: string };

/** فحص للعرض فقط (Preview) — من غير حجز استخدام فعلي */
export async function checkCoupon(codeRaw: string, phone: string): Promise<CouponCheckResult> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { valid: false, error: "اكتب كود الخصم." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { valid: false, error: "الكود غير صحيح أو متوقف." };
  if (coupon.usedCount >= coupon.maxUses) return { valid: false, error: "الكود خلصت استخداماته." };

  const existingUse = await prisma.couponUse.findUnique({
    where: { couponId_customerPhone: { couponId: coupon.id, customerPhone: phone } },
  });
  if (existingUse) return { valid: false, error: "استخدمت الكود ده قبل كده." };

  return { valid: true, discountPercent: coupon.discountPercent };
}

/**
 * يتحقق ويحجز استخدام الكوبون فعليًا — لازم يتنفّذ جوه معاملة (transaction)
 * مع إنشاء الطلب في نفس الوقت، عشان نمنع أي سباق (race) لو العميل ضغط "تأكيد" مرتين بسرعة.
 */
export async function redeemCouponInTransaction(
  tx: any,
  codeRaw: string,
  phone: string
): Promise<{ discountPercent: number; code: string }> {
  const code = codeRaw.trim().toUpperCase();
  if (!code) throw new Error("كود الخصم غير صحيح.");

  const coupon = await tx.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) throw new Error("كود الخصم غير صحيح أو متوقف.");
  if (coupon.usedCount >= coupon.maxUses) throw new Error("كود الخصم خلصت استخداماته.");

  const existingUse = await tx.couponUse.findUnique({
    where: { couponId_customerPhone: { couponId: coupon.id, customerPhone: phone } },
  });
  if (existingUse) throw new Error("استخدمت كود الخصم ده قبل كده.");

  await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
  await tx.couponUse.create({ data: { couponId: coupon.id, customerPhone: phone } });

  return { discountPercent: coupon.discountPercent, code };
}

export async function getAllCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
                                                }
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCouponCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

/** ينشئ كوبون مكافأة خاص بعميل معيّن — استخدام واحد بس */
export async function createRewardCoupon(
  discountPercent: number
): Promise<{ code: string }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = `GIFT-${randomCouponCode(6)}`;
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (!existing) {
      await prisma.coupon.create({
        data: { code, discountPercent, maxUses: 1 },
      });
      return { code };
    }
  }
  throw new Error("تعذّر توليد كود فريد، حاول تاني.");
  }
