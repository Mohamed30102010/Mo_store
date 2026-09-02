import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, ORDER_STATUSES, statusLabel } from "@/lib/orders";
import { setOrderStatusAction } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/OrderStatus";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetail({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-brand-300 hover:underline">
            ← كل الطلبات
          </Link>
          <h2 className="tnum mt-1 text-xl font-extrabold text-fg">
            {order.orderNumber}
          </h2>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* تغيير الحالة */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-3 font-bold text-fg">تغيير حالة الطلب</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => {
            const isCurrent = s === order.status;
            return (
              <form action={setOrderStatusAction} key={s}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="status" value={s} />
                <button
                  type="submit"
                  disabled={isCurrent}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "border-brand-500 bg-brand-600/20 text-brand-200"
                      : "border-line bg-bg text-fg hover:border-brand-600/50 hover:bg-surface-2"
                  }`}
                >
                  {statusLabel(s)}
                </button>
              </form>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          الحالة الحالية مميّزة. اضغط على أي حالة عشان تغيّرها فوراً.
        </p>
      </section>

      {/* المنتجات */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-4 font-bold text-fg">المنتجات</h3>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium text-fg">{item.name}</p>
                <p className="tnum text-sm text-muted">
                  {formatPrice(item.priceCents)} × {item.qty} ·{" "}
                  {item.type === "digital" ? "رقمي" : "ملموس"}
                </p>
              </div>
              <span className="tnum font-bold text-fg">
                {formatPrice(item.priceCents * item.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          <div className="flex items-center justify-between text-muted">
            <span>المجموع الفرعي</span>
            <span className="tnum">{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>الشحن</span>
            <span className="tnum">
              {order.shippingCents > 0 ? formatPrice(order.shippingCents) : "مجاني"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5">
            <span className="font-semibold text-fg">الإجمالي</span>
            <span className="tnum text-lg font-extrabold text-fg">
              {formatPrice(order.totalCents || order.subtotalCents)}
            </span>
          </div>
          {order.rewardPointsEarned !== null && (
            <div className="flex items-center justify-between pt-1.5 text-sm">
              <span className="text-muted">نقاط المكافآت</span>
              <span className="tnum font-semibold text-brand-300">
                {order.rewardPointsReversed > 0
                  ? `${order.rewardPointsEarned - order.rewardPointsReversed} نقطة (اترجع منها ${order.rewardPointsReversed})`
                  : `+${order.rewardPointsEarned} نقطة`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* العميل + الدفع */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-3 font-bold text-fg">العميل</h3>
          <ul className="space-y-1 text-sm text-muted">
            <li>
              الاسم: <span className="text-fg">{order.customerName}</span>
            </li>
            <li className="tnum">
              الموبايل: <span className="text-fg">{order.customerPhone}</span>
            </li>
            {order.customerEmail && (
              <li>
                الإيميل: <span className="text-fg">{order.customerEmail}</span>
              </li>
            )}
            {order.address && (
              <li>
                العنوان: <span className="text-fg">{order.address}</span>
              </li>
            )}
            <li>
              نوع الحساب:{" "}
              <span className="text-fg">
                {order.userId ? "عميل مسجّل" : "زائر"}
              </span>
            </li>
            {order.note && (
              <li>
                ملاحظات: <span className="text-fg">{order.note}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="mb-3 font-bold text-fg">الدفع</h3>
          <p className="text-sm text-muted">
            الطريقة:{" "}
            <span className="text-fg">
              {order.paymentMethod === "cash"
                ? "كاش عند الاستلام"
                : order.paymentMethod === "points"
                  ? "نقاط المكافآت 🎁"
                  : "تحويل / محفظة"}
            </span>
          </p>
          {order.paymentMethod === "transfer" && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-muted">إثبات الدفع:</p>
              {order.proofImage ? (
                <a href={`/api/payment-proof/${order.id}`} target="_blank" rel="noopener noreferrer">
                  {/* الصورة بتتجاب عن طريق مسار محمي سيرفر-ساید — مش رابط Blob مباشر (Phase 3/6) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/payment-proof/${order.id}`}
                    alt="إثبات الدفع"
                    className="max-h-64 rounded-xl border border-line transition-opacity hover:opacity-90"
                  />
                </a>
              ) : (
                <p className="text-sm text-red-300">لم يُرفع إثبات بعد.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
