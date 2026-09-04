import "server-only";
import { prisma } from "@/lib/prisma";

export const NOTIFICATION_TYPES = [
  "order",
  "review",
  "product_request",
  "redeem",
  "signup",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const TYPE_ICON: Record<NotificationType, string> = {
  order: "🧾",
  review: "⭐",
  product_request: "📩",
  redeem: "🎁",
  signup: "👤",
};

export function notificationIcon(type: string): string {
  return TYPE_ICON[type as NotificationType] ?? "🔔";
}

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: { type, title, message, link: link ?? null },
  });
}

export async function getUnreadNotificationsCount(): Promise<number> {
  return prisma.notification.count({ where: { read: false } });
}

export async function getNotifications(limit?: number) {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead() {
  return prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  }
