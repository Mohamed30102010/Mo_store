import Link from "next/link";
import { site } from "@/lib/site";

/** لوجو سينتاكس: دائرة الدماغ المقسوم (برتقالي/أزرق) + الاسم */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-lg font-extrabold leading-none">
        <span className="text-gradient">{site.name}</span>{" "}
        <span className="text-fg">{site.nameSuffix}</span>
      </span>
      <BrainMark />
    </Link>
  );
}

function BrainMark() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="cool" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      {/* النصف الأيمن (بارد/منطقي) */}
      <path
        d="M32 5a27 27 0 0 1 0 54Z"
        fill="url(#cool)"
        opacity="0.95"
      />
      {/* النصف الأيسر (دافئ/إبداعي) */}
      <path d="M32 5a27 27 0 0 0 0 54Z" fill="url(#warm)" opacity="0.95" />

      {/* عُقد الشبكة */}
      <g fill="#0b0b12">
        <circle cx="22" cy="24" r="2.4" />
        <circle cx="18" cy="38" r="2.4" />
        <circle cx="26" cy="44" r="2.4" />
        <circle cx="42" cy="22" r="2.4" />
        <circle cx="46" cy="36" r="2.4" />
        <circle cx="38" cy="44" r="2.4" />
      </g>
      <g stroke="#0b0b12" strokeWidth="1.4" opacity="0.7">
        <path d="M22 24 18 38M18 38 26 44" />
        <path d="M42 22 46 36M46 36 38 44" />
      </g>

      {/* خط الفصل */}
      <line x1="32" y1="5" x2="32" y2="59" stroke="#0b0b12" strokeWidth="2" />
    </svg>
  );
}
