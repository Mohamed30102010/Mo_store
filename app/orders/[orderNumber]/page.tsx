import Link from "next/link";
import type { Metadata } from "next";
import { getOrderByNumber } from "@/lib/orders";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { OrderStatusBadge, OrderTimeline } from "@/components/OrderStatus";
import PurchaseTracker from "@/components/PurchaseTracker";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `الطلب ${decodeURIComponent(orderNumber)}` };
}

export default async function OrderPage({ params }: Params) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));

  if (!order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface text-3xl">
          🔎
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-fg">
          مفيش طلب بالرقم ده
        </h1>
        <p className="mt-2 text-muted">اتأكد من رقم الطلب وجرّب تاني.</p>
        <Link
          href="/track"
          className="mt-6 rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white transition-opacity hover:opacity-95"
        >
          تتبّع طلب
        </Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  const isOwnerOrAdmin =
    (order.userId && user?.id === order.userId) || user?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* حدث Purchase للبكسلات — بيطلق مرة واحدة بعد إتمام الطلب مباشرة */}
      <PurchaseTracker
        orderNumber={order.orderNumber}
        valueEgp={(order.totalCents || order.subtotalCents) / 100}
      />

      {/* رأس التأكيد */}
      <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-500/15 text-3xl">
          ✅
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-fg">
          استلمنا طلبك، شكراً!
        </h1>
        <p className="mt-1 text-muted">
          رقم طلبك:{" "}
          <span className="tnum select-all font-bold text-brand-300">
            {order.orderNumber}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted">
          احتفظ بالرقم ده عشان تتابع حالة طلبك في أي وقت.
        </p>
      </div>

      {/* الحالة */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-fg">حالة الطلب</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderTimeline status={order.status} />
      </section>

      {/* العناصر */}
      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-4 font-bold text-fg">المنتجات</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="line-clamp-1 font-medium text-fg">{item.name}</p>
                <p className="tnum text-sm text-muted">
                  {formatPrice(item.priceCents)} × {item.qty}
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
        </div>
      </section>

      {/* نقاط المكافآت */}
      {order.userId && (
        <section className="mt-6 rounded-2xl border border-brand-600/40 bg-brand-600/10 p-6">
          <h2 className="mb-1 flex items-center gap-1.5 font-bold text-fg">
            <span aria-hidden="true">🎁</span> نقاط المكافآت
          </h2>
          {order.rewardPointsEarned !== null ? (
            <p className="tnum text-sm text-muted">
              كسبت{" "}
              <span className="font-extrabold text-amber-400">
                +{order.rewardPointsEarned - order.rewardPointsReversed}
              </span>{" "}
              نقطة من الطلب ده.{" "}
              <Link href="/account/points" className="text-brand-300 hover:underline">
                شوف نقاطي
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted">
              هتتحسب نقاط المكافآت بعد ما يتم تسليم الطلب.{" "}
              <Link href="/account/points" className="text-brand-300 hover:underline">
                نقاطي
              </Link>
            </p>
          )}
        </section>
      )}

      {/* الدفع والتوصيل */}
      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-3 font-bold text-fg">الدفع</h2>
          <p className="text-sm text-muted">
            الطريقة:{" "}
            <span className="text-fg">
              {order.paymentMethod === "cash" ? "كاش عند الاستلام" : "تحويل / محفظة"}
            </span>
          </p>
          {order.paymentMethod === "transfer" && order.proofImage && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-muted">إثبات الدفع:</p>
              {isOwnerOrAdmin ? (
                // الصورة بتتجاب عن طريق مسار محمي سيرفر-ساید — مش رابط Blob مباشر (Phase 3/6)
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/payment-proof/${order.id}`}
                  alt="إثبات الدفع"
                  className="max-h-48 rounded-xl border border-line"
                />
              ) : (
                <p className="text-xs text-muted">تم رفع الإثبات ✓</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-3 font-bold text-fg">بيانات المستلِم</h2>
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
          </ul>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/#products"
          className="rounded-xl border border-line bg-surface px-6 py-3 font-semibold text-fg transition-colors hover:bg-surface-2"
        >
          كمّل التسوّق
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white transition-opacity hover:opacity-95"
        >
          محتاج مساعدة؟ كلّمنا
        </a>
      </div>
    </div>
  );
}
