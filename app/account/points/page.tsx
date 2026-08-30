import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPointsBalance, getPointsTransactions, getRewardSettings } from "@/lib/rewards";

export const metadata: Metadata = { title: "نقاطي" };
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  EARNED: "مكافأة شراء",
  SPENT: "استخدام نقاط",
  REFUNDED: "استرجاع",
  ADJUSTMENT: "تعديل إداري",
  EXPIRED: "انتهاء صلاحية",
};

export default async function AccountPointsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/points");

  const [points, txns, { percent }] = await Promise.all([
    getPointsBalance(user.id),
    getPointsTransactions(user.id),
    getRewardSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/account" className="text-sm text-muted hover:text-fg">
        ← رجوع لحسابي
      </Link>

      <h1 className="mt-3 text-xl font-extrabold text-fg">🎁 نقاطي</h1>

      {/* بطاقات الملخّص */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-600/40 bg-brand-600/10 p-5">
          <p className="text-sm text-brand-300">الرصيد الحالي</p>
          <p className="tnum mt-1 text-2xl font-extrabold text-fg">{points.balance}</p>
          <p className="text-xs text-muted">نقطة</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">إجمالي المكتسب</p>
          <p className="tnum mt-1 text-2xl font-extrabold text-fg">{points.lifetimeEarned}</p>
          <p className="text-xs text-muted">نقطة</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="text-sm text-muted">إجمالي المستخدم</p>
          <p className="tnum mt-1 text-2xl font-extrabold text-fg">{points.lifetimeSpent}</p>
          <p className="text-xs text-muted">نقطة</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
        بتكسب <span className="tnum font-semibold text-fg">{percent}%</span> نقاط على قيمة
        المنتجات في كل عملية شراء مؤهّلة، وبتتحسب لما الطلب يوصل "تم التسليم".
      </p>

      {/* سجل الحركات */}
      <h2 className="mt-8 mb-3 text-lg font-extrabold text-fg">سجل الحركات</h2>

      {txns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-muted">لسه مفيش حركات نقاط.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-5">
          {txns.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-fg">
                  {TYPE_LABEL[t.type] ?? t.type}
                  {t.order && (
                    <span className="tnum text-muted"> · طلب #{t.order.orderNumber}</span>
                  )}
                </p>
                <p className="text-sm text-muted">{t.description}</p>
                <p className="tnum text-xs text-muted">
                  {new Date(t.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="shrink-0 text-left">
                <p
                  className={`tnum text-lg font-extrabold ${
                    t.amount >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </p>
                <p className="tnum text-xs text-muted">الرصيد بعدها: {t.balanceAfter}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
