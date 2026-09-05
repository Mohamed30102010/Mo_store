"use client";

import { useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, isValidTheme, type ThemeKey } from "@/lib/theme";

export default function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeKey>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    setActive(isValidTheme(saved) ? saved : DEFAULT_THEME);
  }, []);

  function selectTheme(theme: ThemeKey) {
    setActive(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === DEFAULT_THEME) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }

  return (
    <div className="px-3 py-2">
      <p className="mb-2 text-sm font-semibold text-fg">الثيم</p>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTheme(t.key)}
            aria-label={t.label}
            title={t.label}
            className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-all ${
              active === t.key ? "border-fg scale-110" : "border-transparent"
            }`}
          >
            <span
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: t.color }}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
      }
