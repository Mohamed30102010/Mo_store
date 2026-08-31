import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getActiveProducts } from "@/lib/products";
import { formatPrice, discountLabel } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGrid from "@/components/ProductGrid";
import { getRewardSettings, calculateEarnedPoints } from "@/lib/rewards";

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
  const { percent: rewardPercent } = await getRewardSettings();
  const points = calculateEarnedPoints(product.priceCents, rewardPercent);

  // منتجات تانية (نستبعد الحالي)
  const others = (await getActiveProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* مسار التنقّل */}
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
        {/* الصور */}
        <ProductGallery images={product.images} alt={product.name} />

        {/* المعلومات */}
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

          {/* السعر */}
          <div className="mt-5 flex items-end gap-3">
            <span className="tnum text-3xl font-extrabold text-fg">
              {formatPrice(product.priceCents, product.currency)}
            </span>
            {product.compareAtCents && (
              <span className="tnum pb-1 text-lg text-muted line-through">
                {formatPrice(product.compareAtCents, product.currency)}
              </span>
            )}
          </div>

          {/* نقاط المكافآت المتوقّعة */}
          {points > 0 && (
            <p className="tnum mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-400">
              <span aria-hidden="true">🎁</span>
              هتكسب تقريبًا {points} نقطة مع الشراء ده
            </p>
          )}

          {/* ملاحظة التسليم حسب النوع */}
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span aria-hidden="true">{isDigital ? "⬇️" : "🚚"}</span>
            {isDigital
              ? "تحميل فوري بعد تأكيد الطلب."
              : "شحن للعنوان اللي هتدخّله وقت الطلب."}
          </p>

          <div className="my-6 h-px bg-line" />

          {/* الإضافة للسلة */}
          <AddToCartButton product={product} variant="full" />

          {/* الوصف الكامل */}
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

      {/* منتجات تانية */}
      {others.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-extrabold text-fg">
            منتجات تانية يمكن تعجبك
          </h2>
          <ProductGrid products={others} rewardPercent={rewardPercent} />
        </section>
      )}
    </div>
  );
            }
