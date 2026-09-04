import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = { title: "لوحة التحكم" };
export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "نظرة عامة", icon: "📊" },
  { href: "/admin/orders", label: "الطلبات", icon: "🧾" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/users", label: "العملاء", icon: "👥" },
  { href: "/admin/rewards", label: "نقاط المكافآت", icon: "🎁" },
  { href: "/admin/requests", label: "طلبات المنتجات", icon: "📩" },
  { href: "/admin/reviews", label: "آراء العملاء", icon: "⭐" },
  { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* رأس اللوحة */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-fg">لوحة التحكم</h1>
          <p className="text-sm text-muted">
            أهلاً {admin.name} · <span className="text-brand-300">أدمن</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
          >
            المتجر
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              خروج
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* القائمة الجانبية */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-brand-600/50 hover:bg-surface-2 lg:shrink"
            >
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* المحتوى */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
      }
