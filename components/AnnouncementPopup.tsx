"use client";

import { useEffect, useState } from "react";
import { getActiveAnnouncementAction } from "@/app/actions/announcements";

export default function AnnouncementPopup() {
  const [data, setData] = useState<{ message: string; publishedAt: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);

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
      <div className="animate-scale-in relative flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-brand-600/40 bg-surface shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line p-6 pb-4 text-fg">
          <span className="text-2xl" aria-hidden="true">📢</span>
          <span className="text-lg font-bold">تنبيه</span>
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label="إغلاق"
            className="ms-auto grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <p className="whitespace-pre-wrap break-words leading-7 text-fg" dir="auto">
            {data.message}
          </p>
        </div>
      </div>
    </div>
  );
      }
