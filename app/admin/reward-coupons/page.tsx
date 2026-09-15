import { prisma } from "@/lib/prisma";
import RewardCouponForm from "@/components/admin/RewardCouponForm";

export const metadata = { title: "كوبونات المكافآت" };
export const dynamic = "force-dynamic";

export default async function AdminRewardCouponsPage() {
  const [customers, coupons] = await Promise.all([
    prisma.user.findMany({
      where: { role: "customer" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.coupon.findMany({
      where: { code: { startsWith: "GIFT-" } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-fg">🎁 كوبونات المكافآت</h2>
        <p className="text-sm text-muted">
          ابعت كوبون خصم خاص لعميل معيّن كمكافأة — استخدام واحد بس، ومش هيشتغل لغيره.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-1 font-bold text-fg">إرسال كوبون جديد</h3>
        <p className="mb-4 text-sm text-muted">اختار عميل ونسبة الخصم، وهيوصله إشعار فورًا.</p>
        <RewardCouponForm customers={customers} />
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold text-fg">آخر كوبونات المكافآت</h3>
        {coupons.length === 0 ? (
          <p className="text-muted">لسه مفيش كوبونات مكافآت اتبعتت.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {coupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="tnum font-mono font-bold text-fg" dir="ltr">
                  {c.code}
                </span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="tnum text-brand-300">{c.discountPercent}%</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      c.usedCount > 0
                        ? "border-line bg-bg text-muted"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {c.usedCount > 0 ? "استُخدم" : "لسه متاح"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
      }
