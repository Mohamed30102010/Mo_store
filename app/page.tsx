import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import { getActiveProducts } from "@/lib/products";
import { getRewardSettings } from "@/lib/rewards";

// نجيب المنتجات من قاعدة البيانات في كل طلب (بيانات حيّة)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, { percent: rewardPercent }] = await Promise.all([
    getActiveProducts(),
    getRewardSettings(),
  ]);

  return (
    <>
      <Hero />

      {/* ليه تشتري مننا */}
      <section id="why" className="border-y border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Feature
              title="صفر عمولة"
              desc="كل جنيه من مبيعاتك يوصلك بالكامل — مفيش أي طرف تالت بياخد نسبة."
              icon="٪"
            />
            <Feature
              title="بياناتك ملكك"
              desc="كل الطلبات والعملاء متخزّنين عندك، وتحت سيطرتك الكاملة."
              icon="🔒"
            />
            <Feature
              title="دفع مرن"
              desc="كاش عند الاستلام أو تحويل محفظة/بنك مع رفع إثبات الدفع."
              icon="💳"
            />
          </div>
        </div>
      </section>

      {/* نقاط المكافآت */}
      {rewardPercent > 0 && (
        <section className="border-b border-line bg-brand-600/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-fg">
                <span aria-hidden="true">🎁</span> اشتري. اكسب. اتكافأ.
              </h2>
              <p className="tnum mt-1 text-muted">
                اكسب {rewardPercent}% نقاط على كل عملية شراء مؤهّلة، وابدأ تجمّعها من أول طلب.
              </p>
            </div>
            <a
              href="/login"
              className="shrink-0 rounded-xl border border-brand-600/50 bg-bg px-5 py-2.5 text-sm font-semibold text-brand-300 transition-colors hover:bg-surface-2"
            >
              اعمل حساب وابدأ الكسب
            </a>
          </div>
        </section>
      )}

      {/* شبكة المنتجات */}
      <section id="products" className="scroll-mt-20 bg-bg">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-semibold text-brand-300">
              المتجر
            </span>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-extrabold text-fg sm:text-3xl">
                  <span aria-hidden="true">🛍️</span> منتجاتنا
                </h2>
                <p className="mt-1 text-muted">
                  اختار منتجك وضيفه للسلة في ثواني.
                </p>
              </div>
              <span className="tnum shrink-0 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-brand-300">
                {products.length} منتج
              </span>
            </div>
          </div>

          <ProductGrid products={products} rewardPercent={rewardPercent} />
        </div>
      </section>
    </>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-600/50">
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-surface-2 text-2xl">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
    </div>
  );
}
