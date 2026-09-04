import { getApprovedReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/auth";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";

export const metadata = { title: "آراء العملاء" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const [reviews, user] = await Promise.all([getApprovedReviews(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-extrabold text-fg">آراء العملاء</h1>
      <p className="mb-8 text-muted">شوف تجارب عملائنا، أو شاركنا رأيك انت كمان.</p>

      <div className="mb-10">
        <ReviewForm isLoggedIn={!!user} />
      </div>

      <ReviewsList reviews={reviews} />
    </div>
  );
}
