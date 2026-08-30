// إعدادات المتجر العامة — عدّلها من مكان واحد
export const site = {
  name: "سينتاكس",
  nameSuffix: "Academy",
  tagline: "منتجاتك الرقمية والملموسة في مكان واحد",
  description:
    "متجر بسيط وسريع تبيع بيه منتجاتك بصفر عمولة — تحكّم كامل في طلباتك وعملائك.",
  // روابط تُستخدم لاحقاً في الهيدر/الفوتر
  nav: [
    { label: "المنتجات", href: "/#products" },
    { label: "تتبّع طلب", href: "/track" },
    { label: "الشحن والاسترجاع", href: "/policy" },
    { label: "تواصل", href: "/#contact" },
  ],
  contactEmail: "hello@example.com",
  whatsapp: "201000000000",
  // بيانات الدفع بالتحويل — عدّلها ببياناتك الحقيقية
  payment: {
    walletNumber: "0100 000 0000", // محفظة (فودافون كاش/انستاباي)
    walletName: "سينتاكس Academy",
    bankAccount: "EG00 0000 0000 0000 0000",
    instapay: "syntax@instapay",
    note: "بعد التحويل، ارفع صورة الإيصال عشان نأكّد طلبك بسرعة.",
  },
  // ═══ الشحن — عدّل الأرقام دي حسب شغلك ═══
  // بيتطبّق على الطلبات اللي فيها منتجات ملموسة فقط (الرقمي مفيهوش شحن).
  shipping: {
    flatCents: 7500, // تكلفة الشحن الثابتة (75 جنيه) — بالقروش
    freeAboveCents: 150000, // شحن مجاني لو الطلب ≥ 1500 جنيه — حط null لإلغاء الميزة
    etaText: "التوصيل خلال 2–5 أيام عمل داخل مصر", // بيظهر للعميل في الشيك أوت
  },
  // ═══ سياسة الاسترجاع — بتظهر في صفحة /policy ═══
  returns: {
    windowDays: 14, // مدة الاسترجاع للمنتجات الملموسة (بالأيام)
    refundDays: 7, // خلال قد إيه بنرجّع الفلوس بعد استلام المرتجع
  },
} as const;

/** حساب تكلفة الشحن بالقروش — صفر للطلبات الرقمية بالكامل أو فوق حد الشحن المجاني */
export function shippingCostCents(
  subtotalCents: number,
  hasPhysical: boolean
): number {
  if (!hasPhysical) return 0;
  const { flatCents, freeAboveCents } = site.shipping;
  if (freeAboveCents != null && subtotalCents >= freeAboveCents) return 0;
  return flatCents;
}
