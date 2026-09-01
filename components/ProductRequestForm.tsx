"use client";

import { useActionState } from "react";
import { submitProductRequestAction, type RequestFormState } from "@/app/actions/request";

type Props = {
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
};

const initial: RequestFormState = {};

export default function ProductRequestForm({
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
}: Props) {
  const [state, formAction, isPending] = useActionState(submitProductRequestAction, initial);

  if (state.ok) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-500/40 bg-bg text-2xl">
          ✅
        </div>
        <p className="mt-4 font-bold text-fg">تم إرسال طلبك بنجاح</p>
        <p className="mt-1 text-sm text-muted">
          هنراجع طلبك ونتواصل معاك في أقرب وقت على الإيميل أو الموبايل اللي كتبته.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">الاسم</label>
        <input
          type="text"
          name="name"
          defaultValue={defaultName}
          required
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">الإيميل</label>
        <input
          type="email"
          name="email"
          defaultValue={defaultEmail}
          dir="ltr"
          required
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">رقم الموبايل</label>
        <input
          type="tel"
          name="phone"
          defaultValue={defaultPhone}
          dir="ltr"
          required
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-fg">
          إيه المنتج اللي بتدوّر عليه؟
        </label>
        <textarea
          name="message"
          rows={4}
          required
          placeholder="مثال: عايز كارت أعمال بتصميم مودرن، لوني بنفسجي..."
          className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-brand-gradient px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ الإرسال…" : "إرسال الطلب"}
      </button>
    </form>
  );
         }
