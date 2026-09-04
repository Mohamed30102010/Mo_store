import { prisma } from "@/lib/prisma";
import { setReviewStatusAction } from "@/app/actions/admin";
import { REVIEW_STATUSES } from "@/lib/reviews";

export const metadata = { title: "آراء العملاء" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/40 bg-red-500/10 text-red-300",
};

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const active =
    status && REVIEW_STATUSES.includes(status as never) ? status : "";

  const reviews = await prisma.review.findMany({
    where: active ? { status: active } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const filters = [
    { key: "", label: "الكل" },
    ...REVIEW_STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s] })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-fg">⭐ آراء العملاء</h2>
        <p className="text-sm text-muted">راجع الآراء ووافق عليها قبل ما تظهر للعملاء.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <a
            key={f.key || "all"}
            href={f.key ? `/admin/reviews?status=${f.key}` : "/admin/reviews"}
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

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          مفيش آراء في الحالة دي.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-fg">{r.user.name}</p>
                  <p className="tnum text-sm text-muted" dir="ltr">
                    {r.user.email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_COLOR[r.status]}`}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
              </div>

              <p className="tnum mt-2 text-amber-400">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-fg">{r.comment}</p>

              <p className="tnum mt-3 text-xs text-muted">
                {new Date(r.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {REVIEW_STATUSES.map((s) => {
                  const isCurrent = s === r.status;
                  return (
                    <form action={setReviewStatusAction} key={s}>
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
