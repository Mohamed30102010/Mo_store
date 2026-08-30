import Link from "next/link";
import { getStats, getAllOrders, statusLabel } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatus";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const stats = await getStats();
  const recent = (await getAllOrders()).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* بطاقات الأرقام */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="الإيراد المؤكّد" value={formatPrice(stats.revenueCents)} accent />
        <StatCard label="كل الطلبات" value={String(stats.ordersCount)} />
        <StatCard label="المنتجات" value={String(stats.productsCount)} />
        <StatCard label="العملاء" value={String(stats.customersCount)} />
      </div>

      {/* توزيع الحالات */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MiniStat label={statusLabel("pending")} value={stats.pending} color="text-amber-300" />
        <MiniStat label={statusLabel("confirmed")} value={stats.confirmed} color="text-blue-300" />
        <MiniStat label={statusLabel("delivered")} value={stats.delivered} color="text-green-300" />
        <MiniStat label={statusLabel("cancelled")} value={stats.cancelled} color="text-red-300" />
        <MiniStat label={statusLabel("returned")} value={stats.returned} color="text-purple-300" />
      </div>

      {/* آخر الطلبات */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-fg">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-sm text-brand-300 hover:underline">
            كل الطلبات
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted">لسه مفيش طلبات.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 transition-colors hover:opacity-80"
                >
                  <div>
                    <p className="tnum font-bold text-fg">{o.orderNumber}</p>
                    <p className="text-sm text-muted">{o.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tnum text-sm font-semibold text-fg">
                      {formatPrice(o.totalCents || o.subtotalCents)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
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

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className={`tnum text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
