"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import type { ProductView } from "@/lib/products";
import { calculateEarnedPoints } from "@/lib/rewards-client";

type Props = {
  product: ProductView;
  variant?: "card" | "full";
  rewardPercent?: number;
  qty?: number;
  onQtyChange?: (qty: number) => void;
};

// نبني عنصر السلة من المنتج
function toCartItem(p: ProductView): Omit<CartItem, "qty"> {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    priceCents: p.priceCents,
    currency: p.currency,
    image: p.images[0] ?? "/products/placeholder.svg",
    type: p.type,
  };
}

export default function AddToCartButton({
  product,
  variant = "card",
  rewardPercent = 0,
  qty: controlledQty,
  onQtyChange,
}: Props) {
  const { add } = useCart();
  const [internalQty, setInternalQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const qty = controlledQty ?? internalQty;
  const setQty = onQtyChange ?? setInternalQty;

  function handleAdd() {
    add(toCartItem(product), variant === "full" ? qty : 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 ${
          justAdded ? "bg-emerald-600 animate-pop" : "bg-brand-gradient hover:opacity-95"
        }`}
        aria-label={`أضف ${product.name} للسلة`}
      >
        {justAdded ? "✓ تمت الإضافة" : "أضف للسلة"}
      </button>
    );
  }

  // النسخة الكاملة (صفحة المنتج): عدّاد كمية + زر كبير
  const points = calculateEarnedPoints(product.priceCents * qty, rewardPercent);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted">الكمية</span>
        <div className="flex items-center rounded-xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold text-fg transition-colors hover:bg-surface-2 disabled:text-muted/40 disabled:hover:bg-transparent"
            aria-label="نقص الكمية"
          >
            −
          </button>
          <span className="tnum w-10 text-center font-bold text-fg">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold text-fg transition-colors hover:bg-surface-2"
            aria-label="زود الكمية"
          >
            +
          </button>
        </div>
      </div>

      {/* نقاط المكافآت المتوقّعة — بتتحدّث مع الكمية */}
      {points > 0 && (
        <p className="tnum flex items-center gap-1.5 text-sm font-medium text-amber-400">
          <span aria-hidden="true">🎁</span>
          هتكسب تقريبًا {points} نقطة مع الشراء ده
        </p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className={`w-full rounded-xl px-8 py-3.5 text-center text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] sm:w-auto ${
          justAdded
            ? "bg-emerald-600 shadow-emerald-900/30 animate-pop"
            : "bg-brand-gradient shadow-brand-600/25 hover:opacity-95"
        }`}
      >
        {justAdded ? "✓ تمت الإضافة للسلة" : "أضف للسلة"}
      </button>

      {justAdded && (
        <p className="animate-fade-in-up text-sm font-medium text-emerald-400">
          اتضاف للسلة — افتح السلة من أعلى الصفحة لتكمّل الطلب.
        </p>
      )}
    </div>
  );
                                        }
