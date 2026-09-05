"use client";

import { useEffect, useState } from "react";

export default function AnnouncementPopup({
  message,
  publishedAt,
}: {
  message: string | null;
  publishedAt: string | null; // ISO string
}) {
  const [closed, setClosed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!publishedAt) return;
    const target = new Date(publishedAt).getTime();
    const now = Date.now();

    if (now >= target) {
      setReady(true);
      return;
    }

    // نستنى بالظبط لحد اللحظة المحددة ونظهر التنبيه فورًا من غير Refresh
    const timer = setTimeout(() => setReady(true), target - now);
    return () => clearTimeout(timer);
  }, [publishedAt]);

  if (!message || closed || !ready) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-4">
      <div className="animate-scale-in relative w-full max-w-md rounded-2xl border border-brand-600/40 bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="إغلاق"
          className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          ✕
        </button>
        <div className="mb-3 text-2xl" aria-hidden="true">
          📢
        </div>
        <p className="whitespace-pre-wrap leading-7 text-fg">{message}</p>
      </div>
    </div>
  );
        }
