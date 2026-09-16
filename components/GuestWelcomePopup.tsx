"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SESSION_KEY = "guest_popup_dismissed";
const HIDDEN_PATHS = ["/login", "/register"];

export default function GuestWelcomePopup() {
  const pathname = usePathname();
  const [closed, setClosed] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // لو المستخدم قفل النافذة قبل كده في نفس الزيارة، متظهرش تاني
    const dismissed = sessionStorage.getItem(SESSION_KEY) === "1";
    setClosed(dismissed);
  }, []);

  useEffect(() => {
    if (closed) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [closed]);

  function handleClose() {
    setClosed(true);
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  }

  // مبنظهرش النافذة في صفحة تسجيل الدخول أو إنشاء الحساب نفسها
  const isHiddenPath = HIDDEN_PATHS.some((p) => pathname?.startsWith(p));
  if (closed || !visible || isHiddenPath) return null;

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
          onClick={handleClose}
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
            <Link
              href="/login"
              onClick={handleClose}
              className="rounded-xl bg-brand-gradient px-6 py-3 text-center text-sm font-bold text-white sh
