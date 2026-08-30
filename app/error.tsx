"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // بنسجّل الخطأ في الكونسول للمطوّرين — من غير ما نعرض أي تفاصيل حساسة للعميل
    console.error(error);
  }, [error]);

  return (
    <div className="animate-fade-in-up mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface text-3xl">
        ⚠️
      </div>
      <p className="code-eyebrow mt-4 text-sm text-muted">{"// unexpected error"}</p>
      <h1 className="mt-2 text-2xl font-extrabold text-fg">حصل خطأ غير متوقّع</h1>
      <p className="mt-2 text-muted">
        حاول تاني، ولو المشكلة استمرت تواصل معانا وإحنا هنحلّها بسرعة.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-95"
        >
          حاول تاني
        </button>
        <Link
          href="/"
          className="rounded-xl border border-line bg-surface px-6 py-3 font-semibold text-fg transition-colors hover:bg-surface-2"
        >
          الرجوع للرئيسية
        </Link>
      </div>
      {error.digest && (
        <p className="tnum mt-6 text-xs text-muted/60">مرجع الخطأ: {error.digest}</p>
      )}
    </div>
  );
}
