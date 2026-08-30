import Link from "next/link";

export default function NotFound() {
  return (
    <div className="animate-fade-in-up mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface text-3xl">
        🔎
      </div>
      <p className="code-eyebrow mt-4 text-sm text-muted">{"// error 404"}</p>
      <h1 className="mt-2 text-2xl font-extrabold text-fg">
        الصفحة مش موجودة
      </h1>
      <p className="mt-2 text-muted">
        يمكن المنتج اتشال أو الرابط غلط. ارجع للمتجر وكمّل تسوّق.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-95"
      >
        الرجوع للرئيسية
      </Link>
    </div>
  );
}
