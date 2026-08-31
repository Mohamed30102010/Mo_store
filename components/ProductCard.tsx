import Link from "next/link";
import type { ProductView } from "@/lib/products";
import { formatPrice, discountLabel } from "@/lib/format";
import { calculateEarnedPoints } from "@/lib/rewards";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({
  product,
  rewardPercent,
}: {
  product: ProductView;
  rewardPercent?: number;
}) {
  const img = product.images[0] ?? "/products/placeholder.svg";
  const discount = discountLabel(product.priceCents, product.compareAtCents);
  const isDigital = product.type === "digital";
  const points = rewardPercent ? calculateEarnedPoints(product.priceCents, rewardPercent) : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-brand-600/60 hover:shadow-xl hover:shadow-brand-900/30">
      {/* الصورة */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* الشارات */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {discount && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
              {discount}
            </span>
          )}
          <span className="rounded-full border border-line bg-bg/80 px-2.5 py-1 text-xs font-semibold text-fg backdrop-blur">
            {isDigital ? "رقمي" : "ملموس"}
          </span>
        </div>
      </Link>

      {/* التفاصيل */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-bold leading-6 text-fg transition-colors group-hover:text-brand-300">
            {product.name}
          </h3>
        </Link>
        {product.shortDesc && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {product.shortDesc}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum text-lg font-extrabold text-fg">
                {formatPrice(product.priceCents, product.currency)}
              </span>
              {product.pointsPrice != null && (
                <span className="tnum rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-xs font-bold text-amber-400">
                  أو {product.pointsPrice} نقطة
                </span>
              )}
            </div>
            {product.compareAtCents && (
              <span className="tnum text-sm text-muted line-through">
                {formatPrice(product.compareAtCents, product.currency)}
              </span>
            )}
            {points > 0 && (
              <span className="tnum mt-0.5 text-xs font-medium text-amber-400">
                🎁 +{points} نقطة
              </span>
            )}
          </div>

          <AddToCartButton product={product} variant="card" />
        </div>
      </div>
    </div>
  );
        }
