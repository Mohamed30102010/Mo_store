"use client";

import { useEffect, useState } from "react";
import { getActiveAnnouncementAction } from "@/app/actions/announcements";

export default function AnnouncementPopup() {
  const [data, setData] = useState<{ message: string; publishedAt: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);

  // بنجيب التنبيه مرة واحدة بس عند أول تحميل للموقع (Refresh أو دخول جديد)
  useEffect(() => {
    getActiveAnnouncementAction().then((result) => {
      setData(result);
    });
  }, []);

  useEffect(() => {
    if (!data) {
      setReady(false);
      return;
    }
    const target = new Date(data.publishedAt).getTime();
    const now = Date.now();

    if (now >= target) {
      setReady(true);
      return;
    }

    const timer = setTimeout(() => setReady(true), target - now);
    return () => clearTimeout(timer);
  }, [data]);

  if (!data || closed || !ready) return null;

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
        <p className="whitespace-pre-wrap leading-7 text-fg">{data.message}</p>
      </div>
    </div>
  );
    }
