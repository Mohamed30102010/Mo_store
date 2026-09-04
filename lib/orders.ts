import "server-only";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
  "returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكّد",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

export const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "delivered"];

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as OrderStatus] ?? status;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = `SYX-${randomCode(6)}`;
    const exists = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  return `SYX-${randomCode(9)}`;
}

export type NewOrderItem = {
  productId: string | null;
  name: string;
  priceCents: number;
  qty: number;
  type: string;
};

export type NewOrderInput = {
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  paymentMethod: "cash" | "transfer";
  proofImage: string | null;
  note: string | null;
  shippingCents: number;
  items: NewOrderItem[];
};

export async function createOrder(input: NewOrderInput) {
  const subtotalCents = input.items.reduce(
    (sum, i) => sum + i.priceCents * i.qty,
    0
  );
  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: input.userId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      address: input.address,
      paymentMethod: input.paymentMethod,
      proofImage: input.proofImage,
      note: input.note,
      subtotalCents,
      shippingCents: input.shippingCents,
      totalCents: subtotalCents + input.shippingCents,
      status: "pending",
      items: {
        create: input.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          priceCents: i.priceCents,
          qty: i.qty,
          type: i.type,
        })),
      },
    },
    include: { items: true },
  });

  await createNotification(
    "order",
    "طلب جديد 🧾",
    `طلب جديد من ${input.customerName} — رقم الطلب ${order.orderNumber}`,
    `/admin/orders/${order.id}`
  );

  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include: { items: true },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrders(status?: string) {
  return prisma.order.findMany({
    where: status && ORDER_STATUSES.includes(status as OrderStatus)
      ? { status }
      : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function getStats() {
  const [orders, products, users] = await Promise.all([
    prisma.order.findMany({
      select: { status: true, subtotalCents: true, totalCents: true },
    }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "customer" } }),
  ]);

  const byStatus: Record<string, number> = {};
  let revenueCents = 0;
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status === "confirmed" || o.status === "delivered") {
      revenueCents += o.totalCents || o.subtotalCents;
    }
  }

  return {
    ordersCount: orders.length,
    productsCount: products,
    customersCount: users,
    revenueCents,
    pending: byStatus["pending"] ?? 0,
    confirmed: byStatus["confirmed"] ?? 0,
    delivered: byStatus["delivered"] ?? 0,
    cancelled: byStatus["cancelled"] ?? 0,
    returned: byStatus["returned"] ?? 0,
  };
      }
