"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead,
} from "@/lib/customer-notifications";
import { cleanStr } from "@/lib/validation";

export async function markCustomerNotificationReadAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const id = cleanStr(formData.get("id"), 40);
  const link = cleanStr(formData.get("link"), 200);
  if (id) await markCustomerNotificationRead(id, user.id);

  revalidatePath("/notifications");
  if (link) redirect(link);
}

export async function markAllCustomerNotificationsReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  await markAllCustomerNotificationsRead(user.id);
  revalidatePath("/notifications");
}
