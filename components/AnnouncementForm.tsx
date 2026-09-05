"use client";

import { useActionState } from "react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  type AnnouncementFormState,
} from "@/app/actions/admin";

const initial: AnnouncementFormState = {};

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function AnnouncementForm({
  editing,
}: {
  editing?: { id: string; message: string; publishedAt: Date };
}) {
  const action = editing ? updateAnnouncementAction : createAnnouncementAction;
  const [state, formAction, isPending] = useActionState(action, initial);

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-surface p-5">
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <label className="mb-1 block text-sm font-semibold text-fg">نص التنبيه</label>
      <textarea
        name="message"
        required
        minLength={3}
        maxLength={500}
        rows={3}
        defaultValue={editing?.message}
        placeholder="مثال: هنشتغل من 10 صباحًا لـ 12 بالليل خلال العيد."
        className="w-full resize-none rounded-xl border border-line bg-bg p-3 text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
      />

      <label className="mb-1 mt-4 block text-sm font-semibold text-fg">وقت التنبيه</label>
      <input
        type="datetime-local"
        name="publishedAt"
        defaultValue={toLocalInputValue(editing?.publishedAt ?? new Date())}
        className="tnum w-full rounded-xl border border-line bg-bg p-3 text-fg focus:border-brand-500 focus:outline-none"
        dir="ltr"
      />

      {state.error && <p className="mt-3 text-sm text-red-300">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-95 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "جارٍ الحفظ…" : editing ? "حفظ التعديل" : "نشر التنبيه"}
      </button>
    </form>
  );
}
