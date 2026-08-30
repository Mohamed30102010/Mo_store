import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

/**
 * نظام نقاط المكافآت — كل المنطق الحساس هنا وبس (Phase 64: centralized business logic).
 * قاعدة أساسية: النقاط بتتمنح بس لما الطلب يوصل لحالة "delivered" (مش وقت الإنشاء)،
 * وبتتراجع لو الطلب اتلغى بعد كده أو رجع "returned". العميل الزائر (بدون حساب) مالوش نقاط.
 */

const DEFAULT_REWARD_PERCENT = 30;
const MIN_REWARD_PERCENT = 0;
const MAX_REWARD_PERCENT = 100;

export type RewardSettings = {
  percent: number; // 0–100
};

/** نسبة المكافآت الحالية من الإعدادات — بترجع الافتراضي (30%) لو مش متظبطة أو غير صالحة */
export async function getRewardSettings(): Promise<RewardSettings> {
  const settings = await getSettings();
  const raw = Number(settings.reward_percent);
  const percent =
    Number.isFinite(raw) && raw >= MIN_REWARD_PERCENT && raw <= MAX_REWARD_PERCENT
      ? raw
      : DEFAULT_REWARD_PERCENT;
  return { percent };
}

/** تحقّق من صحة نسبة مدخلة من الأدمن قبل الحفظ */
export function isValidRewardPercent(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_REWARD_PERCENT && value <= MAX_REWARD_PERCENT;
}

/**
 * المبلغ المؤهّل للمكافآت من الطلب — الافتراضي: subtotal المنتجات (مش شامل الشحن).
 * مركزية هنا عشان لو اتضافت خصومات/ضرائب منفصلة لاحقًا نعدّل مكان واحد بس.
 */
export function calculateEligiblePurchaseCents(order: { subtotalCents: number }): number {
  return Math.max(0, order.subtotalCents);
}

/** حساب النقاط المكتسبة من مبلغ مؤهّل (بالقروش) ونسبة مئوية */
export function calculateEarnedPoints(eligibleCents: number, percent: number): number {
  if (eligibleCents <= 0 || percent <= 0) return 0;
  const eligibleEgp = eligibleCents / 100;
  return Math.floor(eligibleEgp * (percent / 100));
}

/** نقاط تقديرية لمبلغ معيّن — تُستخدم في واجهة العميل (صفحة منتج/سلة/تشك أوت) كتقدير فقط */
export async function estimatePoints(eligibleCents: number): Promise<number> {
  const { percent } = await getRewardSettings();
  return calculateEarnedPoints(eligibleCents, percent);
}

// ═══ منح النقاط (Order → delivered) ═══

/**
 * يمنح نقاط طلب واحد لمرة واحدة بس (idempotent) — بيتنفّذ لما الطلب يوصل "delivered".
 * الحماية من الازدواجية: تحديث شرطي (compare-and-swap) على rewardPointsEarned = null.
 */
export async function awardOrderPoints(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.status !== "delivered") return; // بس الطلبات المكتملة فعليًا
  if (!order.userId) return; // زائر بدون حساب — مفيش حساب نقاط يتحط فيه
  if (order.rewardPointsEarned !== null) return; // اتمنحت قبل كده

  const { percent } = await getRewardSettings();
  const eligibleCents = calculateEligiblePurchaseCents(order);
  const points = calculateEarnedPoints(eligibleCents, percent);
  if (points <= 0) return;

  await prisma.$transaction(async (tx) => {
    // Compare-and-swap: لو صف تاني سبقنا ومنح النقاط، الشرط هيفشل ومفيش تكرار
    const claim = await tx.order.updateMany({
      where: { id: orderId, rewardPointsEarned: null },
      data: { rewardPointsEarned: points },
    });
    if (claim.count === 0) return; // حد تاني منح النقاط قبلنا (race) — نوقف هنا

    const account = await tx.pointsAccount.upsert({
      where: { userId: order.userId! },
      update: {},
      create: { userId: order.userId! },
    });
    const balanceAfter = account.balance + points;

    await tx.pointsAccount.update({
      where: { userId: order.userId! },
      data: {
        balance: balanceAfter,
        lifetimeEarned: account.lifetimeEarned + points,
      },
    });

    await tx.pointsTransaction.create({
      data: {
        userId: order.userId!,
        orderId: order.id,
        type: "EARNED",
        amount: points,
        description: `مكافأة الشراء — طلب #${order.orderNumber}`,
        balanceAfter,
      },
    });
  });
}

/**
 * يرجّع (يعكس) نقاط طلب سبق منحها — بيتنفّذ لو الطلب اتلغى بعد التسليم أو رجع "returned".
 * بيرجّع الباقي اللي لسه ماترجعش بس (مش أكتر من مرة)، ومايخليش الرصيد يعدّي تحت الصفر.
 */
export async function reverseOrderPoints(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.userId) return;
  if (order.rewardPointsEarned === null) return; // مفيش نقاط اتمنحت أصلاً

  const remaining = order.rewardPointsEarned - order.rewardPointsReversed;
  if (remaining <= 0) return; // اترجعت بالكامل قبل كده

  await prisma.$transaction(async (tx) => {
    // نفس أسلوب الـ compare-and-swap لمنع الترجيع المزدوج
    const claim = await tx.order.updateMany({
      where: { id: orderId, rewardPointsReversed: order.rewardPointsReversed },
      data: { rewardPointsReversed: order.rewardPointsReversed + remaining },
    });
    if (claim.count === 0) return;

    const account = await tx.pointsAccount.findUnique({ where: { userId: order.userId! } });
    if (!account) return;

    const deduction = Math.min(remaining, account.balance); // ميعديش تحت الصفر
    const balanceAfter = account.balance - deduction;

    await tx.pointsAccount.update({
      where: { userId: order.userId! },
      data: { balance: balanceAfter },
    });

    await tx.pointsTransaction.create({
      data: {
        userId: order.userId!,
        orderId: order.id,
        type: "REFUNDED",
        amount: -deduction,
        description: `استرجاع نقاط — طلب #${order.orderNumber} (${statusReversalLabel(order.status)})`,
        balanceAfter,
      },
    });
  });
}

function statusReversalLabel(status: string): string {
  if (status === "returned") return "مرتجع";
  if (status === "cancelled") return "ملغي";
  return status;
}

// ═══ تعديل يدوي من الأدمن (Phase 46) ═══

export async function adjustPoints(
  userId: string,
  amount: number,
  reason: string,
  adminEmail: string
): Promise<void> {
  if (!Number.isFinite(amount) || amount === 0) throw new Error("قيمة التعديل غير صالحة.");
  const cleanReason = reason.trim().slice(0, 300);
  if (!cleanReason) throw new Error("لازم تكتب سبب التعديل.");

  await prisma.$transaction(async (tx) => {
    const account = await tx.pointsAccount.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const balanceAfter = Math.max(0, account.balance + amount);
    const actualDelta = balanceAfter - account.balance;

    await tx.pointsAccount.update({
      where: { userId },
      data: {
        balance: balanceAfter,
        lifetimeEarned:
          actualDelta > 0 ? account.lifetimeEarned + actualDelta : account.lifetimeEarned,
        lifetimeSpent:
          actualDelta < 0 ? account.lifetimeSpent + Math.abs(actualDelta) : account.lifetimeSpent,
      },
    });

    await tx.pointsTransaction.create({
      data: {
        userId,
        type: "ADJUSTMENT",
        amount: actualDelta,
        description: `تعديل يدوي بواسطة ${adminEmail} — ${cleanReason}`,
        balanceAfter,
      },
    });
  });
}

// ═══ إنفاق النقاط — البنية جاهزة لاسترداد مستقبلي، لكن مش مفعّلة في أي واجهة حاليًا (Phase 44) ═══

export async function spendPoints(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("قيمة الإنفاق غير صالحة.");

  await prisma.$transaction(async (tx) => {
    const account = await tx.pointsAccount.findUnique({ where: { userId } });
    if (!account || account.balance < amount) throw new Error("رصيد النقاط غير كافٍ.");

    const balanceAfter = account.balance - amount;
    await tx.pointsAccount.update({
      where: { userId },
      data: { balance: balanceAfter, lifetimeSpent: account.lifetimeSpent + amount },
    });

    await tx.pointsTransaction.create({
      data: {
        userId,
        type: "SPENT",
        amount: -amount,
        description: description.trim().slice(0, 300),
        balanceAfter,
      },
    });
  });
}

// ═══ قراءة ═══

export async function getPointsBalance(userId: string): Promise<{
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}> {
  const account = await prisma.pointsAccount.findUnique({ where: { userId } });
  return {
    balance: account?.balance ?? 0,
    lifetimeEarned: account?.lifetimeEarned ?? 0,
    lifetimeSpent: account?.lifetimeSpent ?? 0,
  };
}

export async function getPointsTransactions(userId: string, limit = 50) {
  return prisma.pointsTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { order: { select: { orderNumber: true } } },
  });
}

/** إحصائيات عامة للوحة تحكم الأدمن (Phase 46) */
export async function getRewardsStats() {
  const [issuedAgg, spentAgg, reversedAgg, customersWithPoints, recent] = await Promise.all([
    prisma.pointsTransaction.aggregate({
      where: { type: "EARNED" },
      _sum: { amount: true },
    }),
    prisma.pointsTransaction.aggregate({
      where: { type: "SPENT" },
      _sum: { amount: true },
    }),
    prisma.pointsTransaction.aggregate({
      where: { type: "REFUNDED" },
      _sum: { amount: true },
    }),
    prisma.pointsAccount.count({ where: { balance: { gt: 0 } } }),
    prisma.pointsTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } }, order: { select: { orderNumber: true } } },
    }),
  ]);

  return {
    totalIssued: issuedAgg._sum.amount ?? 0,
    totalSpent: Math.abs(spentAgg._sum.amount ?? 0),
    totalReversed: Math.abs(reversedAgg._sum.amount ?? 0),
    customersWithPoints,
    recent,
  };
}

export async function getAllPointsAccounts() {
  return prisma.pointsAccount.findMany({
    where: { OR: [{ balance: { gt: 0 } }, { lifetimeEarned: { gt: 0 } }] },
    orderBy: { balance: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}
