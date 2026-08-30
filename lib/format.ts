// أدوات تنسيق مشتركة

/** تحويل القروش لسعر منسّق بالجنيه (أو أي عملة) */
export function formatPrice(cents: number, currency = "EGP"): string {
  const value = cents / 100;
  const formatted = new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  const label = currency === "EGP" ? "ج.م" : currency;
  return `${formatted} ${label}`;
}

/** نسبة الخصم كنص، مثلاً "-25%" — أو null لو مفيش خصم */
export function discountLabel(
  priceCents: number,
  compareAtCents?: number | null
): string | null {
  if (!compareAtCents || compareAtCents <= priceCents) return null;
  const pct = Math.round((1 - priceCents / compareAtCents) * 100);
  return `-${pct}%`;
}
