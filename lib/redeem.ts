import "server-only";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";

/**
 * شراء منتج بالكامل بالنقاط (بدون فلوس) — بيخصم النقاط وينشئ الطلب في عملية واحدة
 * ذرّية (atomic) عشان نمنع أي سباق (race) لو العميل ضغط الزرار أكتر من مرة بسرعة.
 */
export async function redeemProductWithPoints(
  userId: string,
  productId: string,
  customer: { name: string; phone: string; email: string | null }
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) throw new Error("المنتج غير متاح حاليًا.");
  if (product.pricePoints == null) throw new Error("المنتج ده مش متاح للشراء بالنقاط.");

  const orderNumber = await generateOrderNumber();

  return prisma.$transaction(async (tx) => {
    const account = await tx.pointsAccount.findUnique({ where: { userId } });
    if (!account || account.balance < product.pricePoints!) {
      throw new Error("رصيد نقاطك مش كافي لشراء المنتج ده.");
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        paymentMethod: "points",
        status: "confirmed",
        subtotalCents: 0,
        shippingCents: 0,
        totalCents: 0,
        items: {
          create: [
            {
              productId: product.id,
              name: product.name,
              priceCents: 0,
              qty: 1,
              type: product.type,
            },
          ],
        },
      },
      include: { items: true },
    });

    const balanceAfter = account.balance - product.pricePoints!;
    await tx.pointsAccount.update({
      where: { userId },
      data: {
        balance: balanceAfter,
        lifetimeSpent: account.lifetimeSpent + product.pricePoints!,
      },
    });

    await tx.pointsTransaction.create({
      data: {
        userId,
        orderId: order.id,
        type: "SPENT",
        amount: -product.pricePoints!,
        description: `شراء منتج بالنقاط — ${product.name} (طلب #${order.orderNumber})`,
        balanceAfter,
      },
    });

    return order;
  });
}
