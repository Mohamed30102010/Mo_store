import type { Metadata } from "next";
import { searchProducts } from "@/lib/products";
import { getRewardSettings } from "@/lib/rewards";
import ProductGrid from "@/components/ProductGrid";
import SearchBox from "@/components/SearchBox";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `نتائج البحث عن "${q}"` : "البحث" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [results, { percent: rewardPercent }] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getRewardSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-xl font-extrabold text-fg">البحث عن منتج</h1>

      <div className="mt-5 max-w-xl">
        <SearchBox defaultValue={query} autoFocus />
      </div>

      {!query ? (
        <p className="mt-8 text-muted">اكتب اسم المنتج اللي بتدوّر عليه فوق.</p>
      ) : results.length === 0 ? (
        <div className="animate-fade-in-up mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-bg text-2xl">
            🔎
          </div>
          <p className="mt-4 font-semibold text-fg">
            مفيش نتائج لـ "{query}"
          </p>
          <p className="mt-1 text-sm text-muted">
            جرّب كلمة تانية أو اتأكد من الإملاء.
          </p>
          <a
            href="/request"
            className="mt-5 rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:opacity-95"
          >
            اطلب المنتج ده منّا
          </a>
        </div>
      ) : (
        <>
          <p className="mt-6 mb-4 text-sm text-muted">
            <span className="tnum font-semibold text-fg">{results.length}</span> نتيجة
            لـ "{query}"
          </p>
          <ProductGrid products={results} rewardPercent={rewardPercent} />
        </>
      )}
    </div>
  );
    }
