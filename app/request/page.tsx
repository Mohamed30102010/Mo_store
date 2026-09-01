import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import ProductRequestForm from "@/components/ProductRequestForm";

export const metadata: Metadata = { title: "اطلب منتج" };
export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-xl font-extrabold text-fg">مش لاقي اللي بتدوّر عليه؟</h1>
      <p className="mt-2 text-muted">
        اكتب لنا تفاصيل المنتج اللي محتاجه، وهنتواصل معاك بأسرع وقت.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <ProductRequestForm
          defaultName={user?.name ?? ""}
          defaultEmail={user?.email ?? ""}
          defaultPhone={user?.phone ?? ""}
        />
      </div>
    </div>
  );
}
