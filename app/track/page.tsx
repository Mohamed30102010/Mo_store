import type { Metadata } from "next";
import TrackForm from "@/components/TrackForm";

export const metadata: Metadata = { title: "تتبّع طلب" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface text-3xl">
          🚚
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-fg">تتبّع طلبك</h1>
        <p className="mt-2 text-muted">
          اكتب رقم الطلب (بيبدأ بـ SYX-) وشوف حالته على طول.
        </p>
      </div>
      <div className="mt-8">
        <TrackForm />
      </div>
    </div>
  );
}
