import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCustomerNotifications, customerNotificationIcon } from "@/lib/customer-notifications";
import {
  markCustomerNotificationReadAction,
  markAllCustomerNotificationsReadAction,
} from "@/app/actions/customer-notifications";

export const metadata = { title: "الإشعارات" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const notifications = await getCustomerNotifications(user.id, 100);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">🔔 الإشعارات</h1>
          <p className="mt-1 text-muted">آخر تحديثات المتجر اللي تخصّك.</p>
        </div>
        {hasUnread && (
          <form action={markAllCustomerNotificationsReadAction}>
            <button
              type="submit"
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
            >
              تحديد الكل كمقروء
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          مفيش إشعارات لسه.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <form action={markCustomerNotificationReadAction}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="link" value={n.link ?? ""} />
                <button
                  type="submit"
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-right transition-colors ${
                    n.read
                      ? "border-line bg-surface text-muted"
                      : "border-brand-500/40 bg-brand-600/10 text-fg"
                  }`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {customerNotificationIcon(n.type)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-bold">{n.title}</span>
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                      )}
                    </span>
                    <span className="mt-1 block text-sm leading-6">{n.message}</span>
                    <span className="tnum mt-1 block text-xs text-muted/70">
                      {new Date(n.createdAt).toLocaleString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
            }
