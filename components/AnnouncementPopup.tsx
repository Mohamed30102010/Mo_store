"use client";

import { useState } from "react";

export default function AnnouncementPopup({ message }: { message: string | null }) {
  const [closed, setClosed] = useState(false);

  if (!message || closed) return null;

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
