import { prisma } from "@/lib/prisma";
import { setProductRequestStatusAction } from "@/app/actions/admin";
import { PRODUCT_REQUEST_STATUSES } from "@/lib/product-requests";

export const metadata = { title: "طلبات المنتجات" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  closed: "مغلق",
};

const STATUS_COLOR: Record<string, string> = {
  new: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  contacted: "border-brand-500/40 bg-brand-600/10 text-brand-300",
  closed: "border-line bg-surface text-muted",
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminRequestsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active =
    status && PRODUCT_REQUEST_STATUSES.includes(status as never) ? status : "";

  const requests = await prisma.productRequest.findMany({
    where: active ? { status: active } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const filters = [
    { key: "", label: "الكل" },
    ...PRODUCT_REQUEST_STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s] })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-fg">📩 طلبات المنتجات</h2>
        <p className="text-sm text-muted">منتجات طلبها عملاء ومش موجودة عندك دلوقتي.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <a
            key={f.key || "all"}
            href={f.key ? `/admin/requests?status=${f.key}` : "/admin/requests"}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              f.key === active
                ? "border-brand-500 bg-brand-600/15 text-brand-200"
                : "border-line bg-surface text-muted hover:text-fg"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          مفيش طلبات في الحالة دي.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-fg">
                    {r.name}
                    {r.user && <span className="text-sm text-muted"> (عميل مسجّل)</span>}
                  </p>
                  <p className="tnum text-sm text-muted" dir="ltr">
                    {r.email} · {r.phone}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[r.status]}`}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-fg">{r.message}</p>

              <p className="tnum mt-3 text-xs text-muted">
                {new Date(r.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={`https://wa.me/${r.phone.replace(/^0/, "20").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
                >
                  واتساب
                </a>
                <a
                  href={`mailto:${r.email}`}
                  className="rounded-lg border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
                >
                  إيميل
                </a>

                <span className="mx-1 h-4 w-px bg-line" />

                {PRODUCT_REQUEST_STATUSES.map((s) => {
                  const isCurrent = s === r.status;
                  return (
                    <form action={setProductRequestStatusAction} key={s}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={s} />
                      <button
                        type="submit"
                        disabled={isCurrent}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isCurrent
                            ? "border-brand-500 bg-brand-600/20 text-brand-200"
                            : "border-line bg-bg text-fg hover:border-brand-600/50 hover:bg-surface-2"
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
    }
