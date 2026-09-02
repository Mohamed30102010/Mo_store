"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { redeemProductWithPoints } from "@/lib/redeem";

export type RedeemState = { error?: string };

export async function redeemProductAction(
  _prev: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const user = await getCurrentUser();
  if (!user) return { error: "لازم تسجّل دخول الأول عشان تشتري بالنقاط." };

  const productId = String(formData.get("productId") || "");
  if (!productId) return { error: "منتج غير معروف." };

  let orderNumber: string;
  try {
    const order = await redeemProductWithPoints(user.id, productId, {
      name: user.name,
      phone: user.phone ?? "",
      email: user.email,
    });
    orderNumber = order.orderNumber;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "حصل خطأ أثناء الشراء." };
  }

  redirect(`/orders/${orderNumber}`);
  }
