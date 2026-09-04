"use client";

import { useState } from "react";
import type { ProductView } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { calculateEarnedPoints } from "@/lib/rewards-client";
import AddToCartButton from "./AddToCartButton";
import RedeemPointsButton from "./RedeemPointsButton";

export default function ProductPurchasePanel({
  product,
  rewardPercent,
  userPointsBalance,
  isLoggedIn,
  isDigital,
}: {
  product: ProductView;
  rewardPercent: number;
  userPointsBalance: number;
  isLoggedIn: boolean;
  isDigital: boolean;
}) {
  const [qty, setQty] = useState(1);

  const totalPriceCents = product.priceCents * qty;
  const totalCompareAtCents = product.compareAtCents
    ? product.compareAtCents * qty
    : undefined;
  const totalPricePoints =
    product.pricePoints != null ? product.pricePoints * qty : null;

  return (
    <div className="flex flex-col">
      <div className="mt-5 flex items-end gap-3">
        <span className="tnum text-3xl font-extrabold text-fg">
          {formatPrice(totalPriceCents, product.currency)}
        </span>
        {totalCompareAtCents && (
          <span className="tnum pb-1 text-lg text-muted line-through">
            {formatPrice(totalCompareAtCents, product.currency)}
          </span>
        )}
      </div>

      {totalPricePoints != null && (
        <p className="tnum mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-brand-300">
          <span aria-hidden="true">🎁</span>
          أو اشتريه بـ {totalPricePoints} نقطة
        </p>
      )}

      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <span aria-hidden="true">{isDigital ? "⬇️" : "🚚"}</span>
        {isDigital
          ? "تحميل فوري بعد تأكيد الطلب."
          : "شحن للعنوان اللي هتدخّله وقت الطلب."}
      </p>

      <div className="my-6 h-px bg-line" />

      <AddToCartButton
        product={product}
        variant="full"
        rewardPercent={rewardPercent}
        qty={qty}
        onQtyChange={setQty}
      />

      {totalPricePoints != null && (
        <div className="mt-4">
          <RedeemPointsButton
            productId={product.id}
            pricePoints={totalPricePoints}
            userBalance={userPointsBalance}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </div>
  );
}
