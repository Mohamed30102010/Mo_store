import Link from "next/link";
import { site } from "@/lib/site";

/** لوجو MO STORE: مونوجرام MD بأسلوب Monster Design — بيتلوّن حسب الثيم المختار */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <MDMark />
      <span className="text-lg font-extrabold leading-none">
        <span className="text-gradient">{site.name}</span>{" "}
        <span className="text-fg">{site.nameSuffix}</span>
      </span>
    </Link>
  );
}

function MDMark() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="mdGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-brand-200)" />
          <stop offset="0.5" stopColor="var(--color-brand-500)" />
          <stop offset="1" stopColor="var(--color-brand-600)" />
        </linearGradient>
      </defs>

      {/* خلفية دائرية سوداء */}
      <circle cx="32" cy="32" r="31" fill="var(--color-bg)" stroke="url(#mdGold)" strokeWidth="1.5" />

      {/* حرف M — الجزء الأيسر */}
      <path
        d="M14 44V20l8 12 6-12v24"
        stroke="url(#mdGold)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* حرف D — الجزء الأيمن */}
      <path
        d="M34 20h6a12 12 0 0 1 0 24h-6V20Z"
        stroke="url(#mdGold)"
        strokeWidth="5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
