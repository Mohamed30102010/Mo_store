import Link from "next/link";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/lib/auth";
import Logo from "./Logo";
import CartButton from "./CartButton";
import MobileNav from "./MobileNav";
import HeaderShell from "./HeaderShell";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderShell>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* أزرار اليمين (في RTL): الحساب + لوحة التحكم للأدمن */}
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              <UserIcon />
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              <span className="sm:hidden">حسابي</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              دخول / حساب جديد
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-fg transition-colors hover:bg-surface-2 sm:flex"
            >
              <GridIcon />
              لوحة التحكم
            </Link>
          )}
        </div>

        {/* روابط الوسط + البحث + السلة + قائمة الموبايل */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="بحث عن منتج"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-fg transition-colors hover:bg-surface-2"
          >
            <SearchIcon />
          </Link>
          <CartButton />
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {site.nav.map((item, i) => {
  const cls =
    i === 0
      ? "rounded-xl border border-line bg-surface px-3 py-2 font-semibold text-fg"
      : "rounded-xl px-3 py-2 text-muted transition-colors hover:bg-surface hover:text-fg";
  return item.href.includes("#") ? (
    <a key={item.href} href={item.href} className={cls}>
      {item.label}
    </a>
  ) : (
    <Link key={item.href} href={item.href} className={cls}>
      {item.label}
    </Link>
  );
})}
          </nav>
          <MobileNav items={site.nav} isAdmin={user?.role === "admin"} />
        </div>

        {/* اللوجو (يسار في RTL) */}
        <Logo />
      </div>
    </HeaderShell>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
        }
