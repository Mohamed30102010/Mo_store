"use client";

import { useEffect } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, isValidTheme } from "@/lib/theme";

export default function ThemeProvider() {
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = isValidTheme(saved) ? saved : DEFAULT_THEME;
    if (theme === DEFAULT_THEME) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, []);

  return null;
      }
