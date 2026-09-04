import "server-only";
import { prisma } from "@/lib/prisma";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReviewWithUser = {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: Date;
  user: { name: string };
};

export async function getApprovedReviews(limit?: number): Promise<ReviewWithUser[]> {
  return prisma.review.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });
}

export async function getApprovedReviewsCount(): Promise<number> {
  return prisma.review.count({ where: { status: "approved" } });
}

export async function createReview(
  userId: string,
  rating: number,
  comment: string
) {
  return prisma.review.create({
    data: { userId, rating, comment, status: "pending" },
  });
  }
