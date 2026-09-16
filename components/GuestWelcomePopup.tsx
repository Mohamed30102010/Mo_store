"use client";

import { useEffect, useState } from "react";

export default function GuestWelcomePopup() {
  const [closed, setClosed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (closed || !visible) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="animate-scale-in glow relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-500/50 bg-surface p-7">
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="إغلاق"
          className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          ✕
        </button>

        <div className="relative text-center">
          <div className="animate-pop mb-3 text-4xl" aria-hidden="true">
            🔑✨
          </div>

          <h2 className="text-gradient text-xl font-extrabold leading-snug">
            يرجى تسجيل الدخول لتجربة الموقع بشكل أفضل
          </h2>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <a
              href="/login"
              className="rounded-xl bg-brand-gradient px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              تسجيل الدخول
            </a>
            <button
              type="button"
              onClick={() => setClosed(true)}
              className="rounded-xl border border-line bg-bg px-6 py-3 text-center text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              لاحقًا
            </button>
          </div>
        </div>
      </div>
    </div>
  );
      }
