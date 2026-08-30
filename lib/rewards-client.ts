/**
 * نسخة آمنة للعميل (client) من حساب النقاط التقديرية — دالة رياضية خالصة بدون أي I/O
 * أو استدعاء سيرفر، عشان تُستخدم في مكوّنات "use client" زي السلة والتشك أوت.
 * ده تقدير للعرض بس — السيرفر هو اللي بيحسب القيمة الفعلية النهائية (Phase 43).
 * لازم تفضل مطابقة لـ calculateEarnedPoints في lib/rewards.ts.
 */
export function calculateEarnedPoints(eligibleCents: number, percent: number): number {
  if (eligibleCents <= 0 || percent <= 0) return 0;
  const eligibleEgp = eligibleCents / 100;
  return Math.floor(eligibleEgp * (percent / 100));
}
