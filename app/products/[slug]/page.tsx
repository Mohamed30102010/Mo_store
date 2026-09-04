import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getActiveProducts } from "@/lib/products";
import { discountLabel } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import { getRewardSettings, getPointsBalance } from "@/lib/rewards";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: product.name,
    description: product.shortDesc ?? product.description.slice(0, 150),
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? undefined,
      images: product.images.length ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const discount = discountLabel(product.priceCents, product.compareAtCents);
  const isDigital = product.type === "digital";
  const [{ percent: rewardPercent }, user] = await Promise.all([
    getRewardSettings(),
    getCurrentUser(),
  ]);
  const userPointsBalance = user ? (await getPointsBalance(user.id)).balance : 0;

  const others = (await getActiveProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand-300">
          الرئيسية
        </Link>
        <span>/</span>
        <Link href="/#products" className="hover:text-brand-300">
          المنتجات
        </Link>
        <span>/</span>
        <span className="text-fg">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-brand-300">
              {isDigital ? "منتج رقمي" : "منتج ملموس"}
            </span>
            {discount && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                خصم {discount}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-snug text-fg sm:text-3xl">
            {product.name}
          </h1>

          {product.shortDesc && (
            <p className="mt-2 text-muted">{product.shortDesc}</p>
          )}

          <ProductPurchasePanel
            product={product}
            rewardPercent={rewardPercent}
            userPointsBalance={userPointsBalance}
            isLoggedIn={!!user}
            isDigital={isDigital}
          />

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-bold text-fg">تفاصيل المنتج</h2>
              <p className="whitespace-pre-line leading-7 text-muted">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-fg">
            منتجات تانية يمكن تعجبك
          </h2>
          <ProductGrid
            products={others}
            rewardPercent={rewardPercent}
            userBalance={userPointsBalance}
            isLoggedIn={!!user}
          />
        </section>
      )}
    </div>
  );
      }
