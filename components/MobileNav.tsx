"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import NavLink from "./NavLink";

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

  useEffect(() => {
    setMounted(true);
  }, []);

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

      {mounted &&
        createPortal(
          <div>
            <div
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className={`fixed inset-0 z-[100] bg-black/60 transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            <nav
              aria-label="القائمة الرئيسية"
              className={`fixed inset-y-0 right-0 z-[101] flex w-72 max-w-[85vw] flex-col gap-1 border-l border-line bg-bg p-5 shadow-2xl transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="code-eyebrow text-sm text-muted">{"// menu"}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  ✕
                </button>
              </div>

              {items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 font-semibold text-fg transition-colors hover:bg-surface"
                >
                  {item.label}
                </NavLink>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl border border-line bg-surface px-3 py-3 font-semibold text-fg transition-colors hover:bg-surface-2"
                >
                  لوحة التحكم
                </Link>
              )}
            </nav>
          </div>,
          document.body
        )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
              }
