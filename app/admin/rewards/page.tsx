import { prisma } from "@/lib/prisma";
import { getRewardSettings, getRewardsStats, getAllPointsAccounts } from "@/lib/rewards";
import PointsAdjustForm from "@/components/admin/PointsAdjustForm";

export const metadata = { title: "نقاط المكافآت" };
export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const [{ percent }, stats, accounts, customers] = await Promise.all([
    getRewardSettings(),
    getRewardsStats(),
    getAllPointsAccounts(),
    prisma.user.findMany({
      where: { role: "customer" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-fg">🎁 نقاط المكافآت</h2>
        <p className="text-sm text-muted">
          نسبة المكافآت الحالية: <b className="tnum text-fg">{percent}%</b> — غيّرها من{" "}
          <a href="/admin/settings" className="text-brand-300 hover:underline">
            الإعدادات
          </a>
          .
        </p>
      </div>

      {/* بطاقات الأرقام */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="إجمالي النقاط الممنوحة" value={stats.totalIssued.toLocaleString("ar-EG")} accent />
        <StatCard label="إجمالي النقاط المستخدمة" value={stats.totalSpent.toLocaleString("ar-EG")} />
        <StatCard label="إجمالي النقاط المرتجعة" value={stats.totalReversed.toLocaleString("ar-EG")} />
        <StatCard label="عملاء عندهم رصيد" value={String(stats.customersWithPoints)} />
      </div>

      {/* تعديل يدوي */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-1 font-bold text-fg">تعديل يدوي</h3>
        <p className="mb-4 text-sm text-muted">
          إضافة أو خصم نقاط لعميل معيّن — بيتسجّل كحركة موثّقة في سجل النقاط بتاعه.
        </p>
        <PointsAdjustForm customers={customers} />
      </section>

      {/* أرصدة العملاء */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold text-fg">أرصدة العملاء</h3>
        {accounts.length === 0 ? (
          <p className="text-muted">لسه مفيش عميل كسب نقاط.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {accounts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-bold text-fg">{a.user.name}</p>
                  <p className="text-sm text-muted">{a.user.email}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="tnum font-extrabold text-fg">{a.balance} نقطة</span>
                  <span className="tnum text-muted">مكتسب: {a.lifetimeEarned}</span>
                  <span className="tnum text-muted">مستخدم: {a.lifetimeSpent}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* آخر الحركات */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold text-fg">آخر الحركات</h3>
        {stats.recent.length === 0 ? (
          <p className="text-muted">لسه مفيش حركات.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {stats.recent.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="font-bold text-fg">{t.user.name}</p>
                  <p className="text-sm text-muted">
                    {t.description}
                    {t.order && <span className="tnum"> · #{t.order.orderNumber}</span>}
                  </p>
                </div>
                <span
                  className={`tnum shrink-0 font-extrabold ${
                    t.amount >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent ? "border-brand-600/50 bg-brand-600/10" : "border-line bg-surface"
      }`}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="tnum mt-1 text-lg font-extrabold text-fg">{value}</p>
    </div>
  );
}
