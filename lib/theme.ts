export const THEMES = [
  { key: "gold", label: "ذهبي (الأساسي)", color: "#d4af37" },
  { key: "sky", label: "أزرق فاتح", color: "#0ea5e9" },
  { key: "navy", label: "أزرق غامق", color: "#6366f1" },
  { key: "emerald", label: "أخضر زمردي", color: "#10b981" },
  { key: "ruby", label: "أحمر ياقوتي", color: "#ef4444" },
  { key: "violet", label: "بنفسجي", color: "#8b5cf6" },
] as const;

export type ThemeKey = (typeof THEMES)[number]["key"];

export const THEME_STORAGE_KEY = "site-theme";
export const DEFAULT_THEME: ThemeKey = "gold";

export function isValidTheme(value: string | null): value is ThemeKey {
  return !!value && THEMES.some((t) => t.key === value);
}
