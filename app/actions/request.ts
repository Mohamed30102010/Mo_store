"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { isValidEmail, isValidPhone, isNonEmpty, cleanStr } from "@/lib/validation";

export type RequestFormState = { error?: string; ok?: boolean };

export async function submitProductRequestAction(
  _prev: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const user = await getCurrentUser();

  const name = cleanStr(formData.get("name"), 80);
  const email = cleanStr(formData.get("email"), 120).toLowerCase();
  const phone = cleanStr(formData.get("phone"), 20);
  const message = cleanStr(formData.get("message"), 1000);

  if (!isNonEmpty(name, 2)) return { error: "اكتب اسمك بشكل صحيح." };
  if (!isValidEmail(email)) return { error: "الإيميل غير صحيح." };
  if (!isValidPhone(phone)) return { error: "رقم الموبايل غير صحيح." };
  if (!isNonEmpty(message, 5)) return { error: "اكتب وصف مختصر للمنتج اللي بتدوّر عليه." };

  await prisma.productRequest.create({
    data: {
      userId: user?.id ?? null,
      name,
      email,
      phone,
      message,
    },
  });

  await createNotification(
    "product_request",
    "طلب منتج جديد 📩",
    `${name} طلب منتج: ${message.slice(0, 80)}`,
    "/admin/requests"
  );

  return { ok: true };
    }
