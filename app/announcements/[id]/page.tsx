import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "التنبيه" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AnnouncementDetailPage({ params }: Props) {
  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link href="/" className="text-sm text-brand-300 hover:underline">
        ← الصفحة الرئيسية
      </Link>

      <div className="mt-4 rounded-2xl border border-brand-600/40 bg-surface p-6">
        <div className="mb-3 flex items-center gap-2 text-fg">
          <span className="text-2xl" aria-hidden="true">📢</span>
          <span className="text-lg font-bold">تنبيه</span>
        </div>
        <p className="whitespace-pre-wrap leading-7 text-fg">{announcement.message}</p>
        <p className="tnum mt-4 text-xs text-muted">
          {new Date(announcement.publishedAt).toLocaleString("ar-EG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
                                                             }
