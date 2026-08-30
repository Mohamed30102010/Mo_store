import Link from "next/link";
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
            صفر عمولة · بياناتك ملكك
          </p>
        </div>
      </div>
    </footer>
  );
}
