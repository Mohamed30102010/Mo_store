import { STATUS_FLOW, STATUS_LABELS, statusLabel, type OrderStatus } from "@/lib/orders";

export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    delivered: "bg-green-500/15 text-green-300 border-green-500/40",
    cancelled: "bg-red-500/15 text-red-300 border-red-500/40",
    returned: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
        styles[status] ?? "border-line bg-surface text-muted"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}

/** خط زمني: قيد المراجعة → مؤكّد → تم التسليم */
export function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        الطلب ده اتلغى. لو فيه استفسار تواصل معانا.
      </div>
    );
  }

  if (status === "returned") {
    return (
      <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm text-purple-300">
        الطلب ده اترجّع وفق سياسة الاسترجاع، والمبلغ بيتردّ حسب المدة المذكورة فيها.
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status as OrderStatus);

  return (
    <ol className="flex items-center">
      {STATUS_FLOW.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STATUS_FLOW.length - 1;
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold ${
                  reached
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-line bg-surface text-muted"
                }`}
              >
                {reached ? "✓" : i + 1}
              </span>
              <span
                className={`text-center text-xs ${
                  reached ? "font-semibold text-fg" : "text-muted"
                }`}
              >
                {STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mx-1 h-0.5 flex-1 ${
                  i < currentIndex ? "bg-brand-500" : "bg-line"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
