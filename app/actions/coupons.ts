"use server";

import { checkCoupon, type CouponCheckResult } from "@/lib/coupons";

/** يُستخدم من صفحة الشيك أوت للمعاينة الفورية قبل تأكيد الطلب */
export async function checkCouponAction(
  code: string,
  phone: string
): Promise<CouponCheckResult> {
  if (!phone || phone.trim().length < 8) {
    return { valid: false, error: "اكتب رقم موبايلك الأول." };
  }
  return checkCoupon(code, phone.trim());
}
