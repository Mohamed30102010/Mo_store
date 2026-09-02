"use client";

import { useActionState } from "react";
import { redeemProductAction, type RedeemState } from "@/app/actions/redeem";

const initial: RedeemState = {};

export default function RedeemPointsButton({
  productId,
  pricePoints,
  userBalance,
  isLoggedIn,
  compact = false,
}: {
  productId: string;
  pricePoints: number;
  userBalance: number;
  isLoggedIn: boolean;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(redeemProductAction, initial);
  const sizeClasses = compact ? "px-3 py-2 text-xs" : "px-6 py-3 text-sm";

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className={`block w-full rounded-xl border border-brand-500/50 bg-brand-600/10 text-center font-bold text-brand-200 transition-colors hover:bg-brand-600/20 ${sizeClasses}`}
      >
        {compact ? "سجّل دخول للشراء بالنقاط" : `سجّل دخول عشان تشتري بـ ${pricePoints} نقطة`}
      </a>
    );
  }

  const canAfford = userBalance >= pricePoints;

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <button
          type="submit"
          disabled={!canAfford || isPending}
          className={`w-full rounded-xl border border-brand-500/50 bg-brand-600/10 text-center font-bold text-brand-200 transition-colors hover:bg-brand-600/20 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses}`}
        >
          {isPending
            ? "جارٍ الشراء…"
            : canAfford
              ? `اشتري بـ ${pricePoints} نقطة`
              : compact
                ? `ناقصك ${pricePoints - userBalance} نقطة`
                : `محتاج ${pricePoints - userBalance} نقطة زيادة`}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-300">{state.error}</p>}
    </div>
  );
          }
