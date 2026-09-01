"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type NavItem = { label: string; href: string };

export default function MobileNav({
  items,
  isAdmin,
}: {
  items: readonly NavItem[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // بنستنى الـ mount عشان نعمل createPortal بأمان (document مش موجود وقت الـ SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // قفل تمرير الصفحة + إغلاق بـ Esc أثناء فتح القائمة
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-fg transition-colors hover:bg-surface-2"
      >
        <MenuIcon />
      </button>

      {/*
        القائمة بتتعرض عن طريق Portal مباشرة جوه <body> بدل ما تفضل جوه الهيدر.
        السبب: الهيدر عليه خاصية ضبابية (backdrop-blur)، وده بيكسر خاصية "fixed"
        لأي عنصر جواه (بيخليها تتقيّد بحدود الهيدر بدل الشاشة كلها) — فبتظهر
        القائمة متراكبة وشفافة مع محتوى الصفحة بدل ما تغطّيه بالكامل.
      */}
      {mounted &&
        createPortal(
          <>
            {/* الخلفية المعتمة */}
            <div
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className={`fixed inset-0 z-[100] bg-black/60 transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            {/* لوحة القائمة (تنزلق من اليمين في RTL) */}
            <nav
              aria-label="القائمة الرئيسية"
              className={`fixed inset-y-0 right-0 z-[101] flex w-72 max-w-[85vw] flex-col gap-1 border-l border-line bg-bg p-5 shadow-2xl transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="code-eyebrow text-sm text-muted">{"// menu"}</span>
