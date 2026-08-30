import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * بروكسي آمن لصور إثبات الدفع — Vercel Blob بيدعم access: "public" بس (مفيش
 * "private" فعلي في الـ API)، فالحماية الحقيقية هنا: رابط الـ Blob (عشوائي وغير
 * متوقَّع) ميوصلش للمتصفح خالص. العميل بيطلب من المسار ده بس، وإحنا اللي بنتحقق
 * من الصلاحية سيرفر-ساید قبل ما نجيب الملف من Blob ونبعته — الصلاحية بتتفحص من
 * قاعدة البيانات مش من أي حاجة جاية من العميل (Phase 5/6).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "لازم تسجّل دخول." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, proofImage: true },
  });

  if (!order || !order.proofImage) {
    return NextResponse.json({ error: "الملف مش موجود." }, { status: 404 });
  }

  const isOwner = order.userId !== null && order.userId === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "مش مصرّح لك تشوف الملف ده." }, { status: 403 });
  }

  // نجيب محتوى الملف من Vercel Blob سيرفر-ساید ونبعته للعميل، من غير ما نكشف رابط الـ Blob
  let blobRes: Response;
  try {
    blobRes = await fetch(order.proofImage);
  } catch {
    return NextResponse.json({ error: "تعذّر تحميل الملف." }, { status: 502 });
  }
  if (!blobRes.ok || !blobRes.body) {
    return NextResponse.json({ error: "تعذّر تحميل الملف." }, { status: 502 });
  }

  return new NextResponse(blobRes.body, {
    status: 200,
    headers: {
      "Content-Type": blobRes.headers.get("content-type") ?? "application/octet-stream",
      // ملف حساس — مايتخزّنش في أي كاش مشترك (متصفح/CDN)
      "Cache-Control": "private, no-store",
    },
  });
}
