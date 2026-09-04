import type { ReviewWithUser } from "@/lib/reviews";

export default function ReviewsList({ reviews }: { reviews: ReviewWithUser[] }) {
  if (reviews.length === 0) {
    return <p className="text-center text-muted">لسه مفيش آراء، كن أول من يشارك رأيه!</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-fg">{r.user.name}</p>
            <p className="tnum text-amber-400" dir="ltr">
              {"★".repeat(r.rating)}
              <span className="text-line">{"★".repeat(5 - r.rating)}</span>
            </p>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{r.comment}</p>
          <p className="tnum mt-2 text-xs text-muted/70">
            {new Date(r.createdAt).toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}
