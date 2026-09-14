import "server-only";
import { prisma } from "@/lib/prisma";

export const CUSTOMER_NOTIFICATION_TYPES = ["product", "points", "announcement", "coupon"] as const;
export type CustomerNotificationType = (typeof CUSTOMER_NOTIFICATION_TYPES)[number];

const TYPE_ICON: Record<CustomerNotificationType, string> = {
  product: "🛍️",
  points: "🎁",
  announcement: "📢",
  coupon: "🏷️",
};

export function customerNotificationIcon(type: string): string {
  return TYPE_ICON[type as CustomerNotificationType] ?? "🔔";
}

/** إشعار لعميل واحد بعينه (زي إرسال نقاط) */
export async function notifyCustomer(
  userId: string,
  type: CustomerNotificationType,
  title: string,
  message: string,
  link?: string
) {
  return prisma.customerNotification.create({
    data: { userId, type, title, message, link: link ?? null },
  });
}

/** إشعار لكل العملاء دفعة واحدة (زي منتج جديد أو كوبون جديد) */
export async function broadcastToCustomers(
  type: CustomerNotificationType,
  title: string,
  message: string,
  link?: string
) {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true },
  });
  if (customers.length === 0) return;

  await prisma.customerNotification.createMany({
    data: customers.map((c) => ({
      userId: c.id,
      type,
      title,
      message,
      link: link ?? null,
    })),
  });
}

export async function getUnreadCustomerNotificationsCount(userId: string): Promise<number> {
  return prisma.customerNotification.count({ where: { userId, read: false } });
}

export async function getCustomerNotifications(userId: string, limit?: number) {
  return prisma.customerNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** لازم نتحقق من userId عشان عميل مايقدرش يعلّم إشعار عميل تاني كمقروء */
export async function markCustomerNotificationRead(id: string, userId: string) {
  return prisma.customerNotification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllCustomerNotificationsRead(userId: string) {
  return prisma.customerNotification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  }
