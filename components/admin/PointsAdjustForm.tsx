"use client";

import { useActionState } from "react";
import { adjustPointsAction, type PointsAdjustFormState } from "@/app/actions/admin";

type Customer = { id: string; name: string; email: string };

const initial: PointsAdjustFormState = {};

export default function PointsAdjustForm({ customers }: { customers: Customer[] }) {
  const [state, formAction, isPending] = useActionState(adjustPointsAction, initial);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_2fr_auto] sm:items-end">
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">العميل</label>
        <select
          name="userId"
          required
          className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg focus:border-brand-500 focus:outline-none"
        >
          <option value="">— اختار عميل —</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">القيمة</label>
        <input
          type="number"
          name="amount"
          placeholder="+50 أو -20"
          dir="ltr"
          required
          className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">السبب</label>
        <input
          type="text"
          name="reason"
          placeholder="مثال: تعويض عن تأخير الشحن"
          required
          className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-fit rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ الحفظ…" : "تطبيق"}
      </button>

      {state.error && (
        <p className="sm:col-span-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="sm:col-span-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          ✅ تم تعديل النقاط.
        </p>
      )}
    </form>
  );
}
