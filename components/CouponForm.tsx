"use client";

import { useActionState } from "react";
import { createCouponAction, type CouponFormState } from "@/app/actions/admin";

const initial: CouponFormState = {};
const PERCENTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function CouponForm() {
  const [state, formAction, isPending] = useActionState(createCouponAction, initial);

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-fg">كود الخصم</label>
          <input
            type="text"
            name="code"
            required
            maxLength={40}
            placeholder="مثال: EID25"
            dir="ltr"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
          />
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

        <div>
          <label className="mb-1 block text-sm font-semibold text-fg">عدد الاستخدامات</label>
          <input
            type="number"
            name="maxUses"
            required
            min={1}
            max={100000}
            defaultValue={50}
            className="tnum w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-fg focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {state.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-95 disabled:opacity-50"
      >
        {isPending ? "جارٍ الإنشاء…" : "إنشاء الكوبون"}
      </button>
    </form>
  );
          }
