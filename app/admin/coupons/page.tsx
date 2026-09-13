import { getAllCoupons } from "@/lib/coupons";
import { toggleCouponActiveAction, deleteCouponAction } from "@/app/actions/admin";
import CouponForm from "@/components/CouponForm";

export const metadata = { title: "الكوبونات" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getAllCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-fg">🏷️ الكوبونات</h2>
        <p className="text-sm text-muted">
          كل عميل (برقم موبايله) يقدر يستخدم نفس الكوبون مرة واحدة بس.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-fg">كوبون جديد</h3>
        <CouponForm />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-fg">الكوبونات الحالية</h3>
        {coupons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            مفيش كوبونات لسه.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {coupons.map((c) => {
              const exhausted = c.usedCount >= c.maxUses;
              return (
                <li key={c.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="tnum font-mono text-lg font-extrabold text-fg" dir="ltr">
                        {c.code}
                      </p>
                      <p className="tnum text-sm text-muted">
                        خصم {c.discountPercent}% — استُخدم {c.usedCount} من {c.maxUses}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                        c.active && !exhausted
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-line bg-bg text-muted"
                      }`}
                    >
                      {exhausted ? "خلصت الاستخدامات" : c.active ? "نشط" : "متوقف"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <form action={toggleCouponActiveAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={(!c.active).toString()} />
                      <button
                        type="submit"
                        className="rounded-lg border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
                      >
                        {c.active ? "إيقاف" : "تفعيل"}
                      </button>
                    </form>
                    <form action={deleteCouponAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        حذف
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
                        }
