"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewFormState } from "@/app/actions/reviews";

const initial: ReviewFormState = {};

export default function ReviewForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [state, formAction, isPending] = useActionState(createReviewAction, initial);
  const [rating, setRating] = useState(5);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-muted">لازم تسجّل دخول الأول عشان تكتب رأيك.</p>
        <a
          href="/login"
          className="mt-3 inline-block rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          سجّل دخول
        </a>
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center text-emerald-300">
        شكرًا لرأيك! هيظهر بعد ما يتمت مراجعته من الإدارة.
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-6">
      <h3 className="mb-4 font-bold text-fg">اكتب رأيك</h3>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted">تقييمك</span>
        <div className="flex gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-2xl transition-colors ${n <= rating ? "text-amber-400" : "text-line"}`}
              aria-label={`${n} نجوم`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <input type="hidden" name="rating" value={rating} />

      <textarea
        name="comment"
        required
        minLength={3}
        maxLength={1000}
        rows={4}
        placeholder="إيه رأيك في المتجر؟"
        className="w-full rounded-xl border border-line bg-bg p-3 text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
      />

      {state.error && <p className="mt-2 text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-xl bg-brand-gradient px-5 py-3 text-center text-sm font-bold text-white transition-all hover:opacity-95 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "جارٍ الإرسال…" : "أرسل رأيك"}
      </button>
    </form>
  );
}
