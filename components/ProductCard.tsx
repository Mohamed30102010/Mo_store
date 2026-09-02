import Link from "next/link";
import type { ProductView } from "@/lib/products";
import { formatPrice, discountLabel } from "@/lib/format";
import { calculateEarnedPoints } from "@/lib/rewards";
import AddToCartButton from "./AddToCartButton";
import RedeemPointsButton from "./RedeemPointsButton";

export default function ProductCard({
  product,
  rewardPercent,
  userBalance = 0,
  isLoggedIn = false,
}: {
  product: ProductView;
  rewardPercent?: number;
  userBalance?: number;
  isLoggedIn?: boolean;
}) {
  const img = product.images[0] ?? "/products/placeholder.svg";
  const discount = discountLabel(product.priceCents, product.compareAtCents);
  const isDigital = product.type === "digital";
  const points = rewardPercent ? calculateEarnedPoints(product.priceCents, rewardPercent) : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-brand-600/60 hover:shadow-xl hover:shadow-brand-900/30">
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
            <span className="tnum text-lg font-extrabold text-fg">
              {formatPrice(product.priceCents, product.currency)}
            </span>
            {product.compareAtCents && (
              <span className="tnum text-sm text-muted line-through">
                {formatPrice(product.compareAtCents, product.currency)}
              </span>
            )}
            {product.pricePoints != null && (
              <span className="tnum mt-0.5 text-xs font-semibold text-brand-300">
                أو {product.pricePoints} نقطة
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

        {product.pricePoints != null && (
          <div className="mt-3">
            <RedeemPointsButton
              productId={product.id}
              pricePoints={product.pricePoints}
              userBalance={userBalance}
              isLoggedIn={isLoggedIn}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
            }
