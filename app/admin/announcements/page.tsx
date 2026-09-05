import { getAllAnnouncements } from "@/lib/announcements";
import { toggleAnnouncementActiveAction, deleteAnnouncementAction } from "@/app/actions/admin";
import AnnouncementForm from "@/components/AnnouncementForm";

export const metadata = { title: "التنبيهات" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAllAnnouncements();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-fg">📢 التنبيهات</h2>
        <p className="text-sm text-muted">
          أي تنبيه نشط بيظهر كنافذة منبثقة لكل زوار المتجر لحد ما توقفه.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-fg">تنبيه جديد</h3>
        <AnnouncementForm />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-fg">التنبيهات السابقة</h3>
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-muted">
            مفيش تنبيهات لسه.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li key={a.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                      a.active
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-line bg-bg text-muted"
                    }`}
                  >
                    {a.active ? "نشط" : "متوقف"}
                  </span>
                  <p className="tnum text-xs text-muted">
                    {new Date(a.publishedAt).toLocaleString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-fg">{a.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={toggleAnnouncementActiveAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="active" value={(!a.active).toString()} />
                    <button
                      type="submit"
                      className="rounded-lg border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-fg transition-colors hover:bg-surface-2"
                    >
                      {a.active ? "إيقاف" : "تفعيل"}
                    </button>
                  </form>
                  <form action={deleteAnnouncementAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      حذف
                    </button>
                  </form>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-brand-300">
                    تعديل
                  </summary>
                  <div className="mt-3">
                    <AnnouncementForm
                      editing={{
                        id: a.id,
                        message: a.message,
                        publishedAt: a.publishedAt.toISOString(),
                      }}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
            }
