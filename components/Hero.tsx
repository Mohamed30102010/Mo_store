import { site } from "@/lib/site";

export default function SiteFooter() {
  const year = 2026; // ثابت لتفادي اختلاف الخادم/العميل — يُحدَّث سنوياً
  return (
    <footer id="contact" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="text-lg font-extrabold">
              <span className="text-gradient">{site.name}</span>{" "}
              <span className="text-fg">{site.nameSuffix}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {site.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="mb-3 font-semibold text-fg">روابط</h4>
              <ul className="space-y-2 text-muted">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-brand-300">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-fg">تواصل</h4>
              <ul className="space-y-2 text-muted">
                <li>
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="hover:text-brand-300"
                  >
                    {site.contactEmail}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    className="hover:text-brand-300"
                  >
                    واتساب
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>
            © {year} {site.name} {site.nameSuffix}. كل الحقوق محفوظة.
          </p>
          <p className="rounded-full border border-line bg-surface px-3 py-1 font-medium text-brand-300">
            سهل الاستخدام · بياناتك في أمان
          </p>
        </div>
      </div>
    </footer>
  );
      }import Link from "next/link";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg">
      {/* توهّج خلفي بنفسجي */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/25 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:32px_32px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <span className="code-eyebrow animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-brand-300">
          <span className="text-muted">{"//"}</span>
          تجربتك تهمنا · لأن اختياراتك بتبدأ من هنا
          <span className="terminal-cursor" aria-hidden="true" />
        </span>

        <h1 className="animate-fade-in-up mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-fg sm:text-6xl [animation-delay:80ms]">
          منتجاتك في <span className="text-gradient">مكان واحد</span>
        </h1>

        <p className="animate-fade-in-up mx-auto mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg [animation-delay:150ms]">
          {site.description}
        </p>

        <div className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:220ms]">
          <a
            href="#products"
            className="w-full rounded-xl bg-brand-gradient px-8 py-3.5 text-center font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl hover:shadow-brand-600/40 sm:w-auto"
          >
            اتفرّج على المنتجات
          </a>
          <a
            href="#why"
            className="w-full rounded-xl border border-line bg-surface px-8 py-3.5 text-center font-semibold text-fg transition-all hover:-translate-y-0.5 hover:bg-surface-2 sm:w-auto"
          >
            ليه تشتري مننا؟
          </a>
        </div>

        {/* نقاط ثقة */}
        <div className="stagger animate-fade-in-up mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 text-sm text-muted sm:grid-cols-3 [animation-delay:280ms]">
          <TrustPoint text="دفع كاش أو تحويل" />
          <TrustPoint text="منتجات رقمية وملموسة" />
          <TrustPoint text="تتبّع حالة طلبك" />
        </div>
      </div>
    </section>
  );
}

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface/60 px-4 py-3 transition-colors hover:border-brand-600/40">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-400"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{text}</span>
    </div>
  );
}
