/**
 * سكريبت فحص اتساق البيانات بين Vercel Blob و PostgreSQL (Phase 2 / Phase 6).
 *
 * محتاج DATABASE_URL و BLOB_READ_WRITE_TOKEN حقيقيين شغّالين عشان يشتغل — من بيئة
 * الإنتاج أو محليًا بعد `vercel env pull .env`. مش بيتنفّذ تلقائيًا؛ شغّله يدويًا:
 *
 *   npm run blob:audit            → تقرير فقط (read-only، آمن 100%)
 *   npm run blob:audit -- --fix   → بعد التقرير، يمسح الـ Blobs اليتيمة فعليًا
 *                                    (اللي مالهاش أي مرجع في المنتجات ولا إثباتات الدفع)
 *
 * بيفحص:
 *  1) Orphan blobs   → ملف موجود على Blob ومفيش أي صف في PostgreSQL بيشاور عليه
 *  2) Broken refs    → صف في PostgreSQL بيشاور على رابط Blob مش موجود فعليًا
 *  3) Duplicate refs → نفس رابط الصورة مستخدم في أكتر من منتج (معلومة للمراجعة، مش عطل بالضرورة)
 *  4) Malformed refs → قيمة مخزّنة في عمود الصور مش رابط صالح أصلاً
 */
import "dotenv/config";
import { list, del } from "@vercel/blob";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

/** نفس منطق lib/upload.ts::deleteBlobIfOwned — مكرّر هنا محليًا عشان السكريبت يفضل
 *  مستقل (بدون الاعتماد على alias "@/" اللي ممكن ما يتحلّش بره Next.js runtime،
 *  بنفس أسلوب prisma/seed.ts). */
async function deleteBlobIfOwned(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return;
    await del(url);
  } catch {
    // متعمّد — تجاهل فشل المسح
  }
}

const MANAGED_PREFIXES = ["products/", "payment-proofs/"];

function isManagedPathname(pathname: string): boolean {
  return MANAGED_PREFIXES.some((p) => pathname.startsWith(p));
}

function parseImagesJson(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function listAllBlobs() {
  const all: { url: string; pathname: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    all.push(...page.blobs.map((b) => ({ url: b.url, pathname: b.pathname })));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return all;
}

async function main() {
  const shouldFix = process.argv.includes("--fix");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL مش متظبط. السكريبت محتاج اتصال حقيقي بـ PostgreSQL.");
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN مش متظبط. السكريبت محتاج اتصال حقيقي بـ Vercel Blob.");
    process.exit(1);
  }

  console.log("🔍 بجيب كل الملفات من Vercel Blob...");
  const blobs = await listAllBlobs();
  const blobUrls = new Set(blobs.map((b) => b.url));
  console.log(`   لقيت ${blobs.length} ملف على Blob.`);

  console.log("🔍 بجيب كل مراجع الصور من PostgreSQL...");
  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
  const orders = await prisma.order.findMany({
    where: { proofImage: { not: null } },
    select: { id: true, orderNumber: true, proofImage: true },
  });

  // كل مرجع في الداتابيز + مصدره (لأغراض التقرير)
  const dbRefs: { url: string; source: string }[] = [];
  const malformed: { value: string; source: string }[] = [];

  for (const p of products) {
    for (const url of parseImagesJson(p.images)) {
      try {
        new URL(url);
        dbRefs.push({ url, source: `منتج "${p.name}" (${p.id})` });
      } catch {
        malformed.push({ value: url, source: `منتج "${p.name}" (${p.id})` });
      }
    }
  }
  for (const o of orders) {
    if (!o.proofImage) continue;
    try {
      new URL(o.proofImage);
      dbRefs.push({ url: o.proofImage, source: `طلب #${o.orderNumber}` });
    } catch {
      malformed.push({ value: o.proofImage, source: `طلب #${o.orderNumber}` });
    }
  }

  const dbUrlSet = new Set(dbRefs.map((r) => r.url));

  // 1) Orphan blobs — ملفات على Blob من مجلداتنا المُدارة ومالهاش أي مرجع في الداتابيز
  const orphanBlobs = blobs.filter(
    (b) => isManagedPathname(b.pathname) && !dbUrlSet.has(b.url)
  );

  // 2) Broken refs — مرجع في الداتابيز بيشاور على رابط مش موجود في قائمة الـ Blobs الفعلية
  //    (بنتأكد الأول إن الرابط ده أصلاً من نفس الـ Blob store بتاعنا، مش رابط خارجي حطّه الأدمن يدويًا)
  const brokenRefs = dbRefs.filter((r) => {
    let hostname = "";
    try {
      hostname = new URL(r.url).hostname;
    } catch {
      return false;
    }
    const looksLikeOurBlob = hostname.endsWith(".public.blob.vercel-storage.com");
    return looksLikeOurBlob && !blobUrls.has(r.url);
  });

  // 3) Duplicate refs — نفس الرابط مستخدم في أكتر من منتج/طلب
  const urlCount = new Map<string, string[]>();
  for (const r of dbRefs) {
    const sources = urlCount.get(r.url) ?? [];
    sources.push(r.source);
    urlCount.set(r.url, sources);
  }
  const duplicates = Array.from(urlCount.entries()).filter(([, sources]) => sources.length > 1);

  // ═══ التقرير ═══
  console.log("\n📋 التقرير:\n");

  console.log(`الملفات المُدارة على Blob: ${blobs.filter((b) => isManagedPathname(b.pathname)).length}`);
  console.log(`مراجع صالحة في PostgreSQL: ${dbRefs.length}`);

  console.log(`\n🟠 Orphan blobs (${orphanBlobs.length}) — ملفات على Blob بدون أي مرجع:`);
  if (orphanBlobs.length === 0) console.log("   لا يوجد ✅");
  else orphanBlobs.forEach((b) => console.log(`   - ${b.pathname}`));

  console.log(`\n🔴 Broken references (${brokenRefs.length}) — مراجع في قاعدة البيانات لملفات مش موجودة على Blob:`);
  if (brokenRefs.length === 0) console.log("   لا يوجد ✅");
  else brokenRefs.forEach((r) => console.log(`   - ${r.source} → ${r.url}`));

  console.log(`\n🟡 Duplicate references (${duplicates.length}) — نفس الرابط في أكتر من مكان (للمراجعة فقط):`);
  if (duplicates.length === 0) console.log("   لا يوجد");
  else duplicates.forEach(([url, sources]) => console.log(`   - ${url}\n     يُستخدم في: ${sources.join("، ")}`));

  console.log(`\n⚠️  Malformed references (${malformed.length}) — قيمة مخزّنة مش رابط صالح:`);
  if (malformed.length === 0) console.log("   لا يوجد ✅");
  else malformed.forEach((m) => console.log(`   - ${m.source} → "${m.value}"`));

  if (shouldFix && orphanBlobs.length > 0) {
    console.log(`\n🧹 --fix: بمسح ${orphanBlobs.length} orphan blob...`);
    for (const b of orphanBlobs) {
      await deleteBlobIfOwned(b.url);
      console.log(`   🗑️  اتمسح: ${b.pathname}`);
    }
  } else if (orphanBlobs.length > 0) {
    console.log(`\nℹ️  شغّل الأمر بـ --fix عشان تمسح الـ orphan blobs دي فعليًا.`);
  }

  console.log("\n✅ خلص الفحص.");
}

main()
  .catch((e) => {
    console.error("❌ السكريبت فشل:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
