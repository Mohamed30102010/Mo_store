"use client";

import { useActionState } from "react";
import { createRewardCouponAction, type RewardCouponFormState } from "@/app/actions/admin";

const initial: RewardCouponFormState = {};
const PERCENTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function RewardCouponForm({
  customers,
}: {
  customers: { id: string; name: string; email: string }[];
}) {
  const [state, formAction, isPending] = useActionState(createRewardCouponAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-fg">العميل</label>
          <select
            name="userId"
            required
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-fg focus:border-brand-500 focus:outline-none"
          >
            <option value="">اختار عميل</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-fg">نسبة الخصم</label>
          <select
            name="discountPercent"
            required
            defaultValue="10"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-fg focus:border-brand-500 focus:outline-none"
          >
            {PERCENTS.map((p) => (
              <option key={p} value={p}>
                {p}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state.ok && state.code && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          ✓ اتبعت الكوبون بنجاح — الكود: <span className="tnum font-mono font-bold">{state.code}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-95 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "جارٍ الإرسال…" : "إرسال كوبون مكافأة"}
      </button>
    </form>
  );
            }
