"use client";

import { useEffect, useState } from "react";

export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-bg/80 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-line shadow-lg shadow-black/20" : "border-transparent"
      }`}
    >
      {children}
    </header>
  );
}
