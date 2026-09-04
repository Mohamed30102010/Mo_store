"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createReview } from "@/lib/reviews";
import { cleanStr, isNonEmpty } from "@/lib/validation";

export type ReviewFormState = { error?: string; ok?: boolean };

export async function createReviewAction(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "لازم تسجّل دخول الأول عشان تكتب رأيك." };

  const rating = Number(cleanStr(formData.get("rating"), 2));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5)
    return { error: "اختار تقييم من 1 لـ 5 نجوم." };

  const comment = cleanStr(formData.get("comment"), 1000);
  if (!isNonEmpty(comment, 3)) return { error: "اكتب رأيك (3 حروف على الأقل)." };

  await createReview(user.id, Math.round(rating), comment);

  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}
