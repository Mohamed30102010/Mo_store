import { getNotifications, notificationIcon } from "@/lib/notifications";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/actions/admin";

export const metadata = { title: "الإشعارات" };
export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications(100);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-fg">🔔 الإشعارات</h2>
          <p className="text-sm text-muted">كل نشاط العملاء في المتجر.</p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsReadAction}>
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
              <form action={markNotificationReadAction}>
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
                    {notificationIcon(n.type)}
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
