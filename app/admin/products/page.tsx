import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/products";
import { deleteProductAction } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-fg">المنتجات</h2>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-95"
        >
          + منتج جديد
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          لسه مفيش منتجات. ابدأ بإضافة أول منتج.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0] ?? "/products/placeholder.svg"}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-bold text-fg">{p.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="tnum font-semibold text-fg">
                    {formatPrice(p.priceCents, p.currency)}
                  </span>
                  <span className="text-muted">
                    {p.type === "digital" ? "رقمي" : "ملموس"}
                  </span>
                  {p.featured && (
                    <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-brand-200">
                      مميّز
                    </span>
                  )}
                  {!p.active && (
                    <span className="rounded-full bg-neutral-600/30 px-2 py-0.5 text-muted">
                      مخفي
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-2"
                >
                  تعديل
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                  >
                    حذف
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
