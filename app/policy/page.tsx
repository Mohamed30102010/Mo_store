import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: `سياسة الشحن والاسترجاع — ${site.name}`,
  description: "كل حاجة عن الشحن والتوصيل والاسترجاع والاستبدال ورد المبالغ.",
};

/** بلوك قسم موحّد الشكل */
function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-fg">
        <span>{icon}</span> {title}
      </h2>
      <div className="space-y-2 text-sm leading-7 text-muted">{children}</div>
    </section>
  );
}

export default function PolicyPage() {
  const { shipping, returns } = site;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-brand-300">
          الرئيسية
        </Link>
        <span>/</span>
        <span className="text-fg">سياسة الشحن والاسترجاع</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-fg sm:text-3xl">
        سياسة الشحن والاسترجاع
      </h1>
      <p className="mt-2 text-muted">
        بنحب كل حاجة تكون واضحة من الأول — دي القواعد اللي بنشتغل بيها.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <Section icon="🚚" title="الشحن والتوصيل">
          <p>
            • تكلفة الشحن الثابتة:{" "}
            <strong className="text-fg">{formatPrice(shipping.flatCents)}</strong>{" "}
            لكل الطلبات اللي فيها منتجات ملموسة.
          </p>
          {shipping.freeAboveCents != null && (
            <p>
              • <strong className="text-fg">شحن مجاني</strong> للطلبات{" "}
              {formatPrice(shipping.freeAboveCents)} أو أكتر. 🎉
            </p>
          )}
          <p>• {shipping.etaText}.</p>
          <p>
            • المنتجات الرقمية بتوصلك فورًا بعد تأكيد الطلب — من غير أي تكلفة
            شحن.
          </p>
        </Section>

        <Section icon="↩️" title="الاسترجاع والاستبدال">
          <p>
            • ليك حق الاسترجاع أو الاستبدال خلال{" "}
            <strong className="text-fg">{returns.windowDays} يوم</strong> من
            استلام المنتج الملموس، بشرط يكون بحالته الأصلية وبكامل محتوياته.
          </p>
          <p>
            • لو المنتج وصلك <strong className="text-fg">تالف أو غلط</strong>،
            بنتحمّل إحنا تكلفة شحن المرتجع بالكامل وبنبعتلك البديل أو نرد
            المبلغ — من غير أي نقاش.
          </p>
          <p>
            • لو الاسترجاع لتغيير رأيك، بيتخصم تكلفة شحن المرتجع من المبلغ
            المسترد.
          </p>
          <p>
            • المنتجات الرقمية (ملفات/كورسات) غير قابلة للاسترجاع بعد التحميل —
            إلا لو الملف معطوب أو مش مطابق للوصف، وساعتها بنرد المبلغ كامل.
          </p>
        </Section>

        <Section icon="💸" title="رد المبلغ">
          <p>
            • بعد استلام المرتجع وفحصه، المبلغ بيتردّ خلال{" "}
            <strong className="text-fg">{returns.refundDays} أيام عمل</strong>{" "}
            على نفس وسيلة الدفع (محفظة/تحويل بنكي).
          </p>
          <p>
            • لو الدفع كان كاش عند الاستلام، بنرد المبلغ على محفظتك أو
            انستاباي.
          </p>
        </Section>

        <Section icon="📞" title="إزاي تطلب استرجاع؟">
          <p>
            كلّمنا على{" "}
            <a
              href={`https://wa.me/${site.whatsapp}`}
              className="font-semibold text-brand-300 hover:underline"
            >
              واتساب
            </a>{" "}
            أو ابعتلنا على{" "}
            <a
              href={`mailto:${site.contactEmail}`}
              className="font-semibold text-brand-300 hover:underline"
            >
              {site.contactEmail}
            </a>{" "}
            ومعاك <strong className="text-fg">رقم الطلب (SYX-XXXXXX)</strong>{" "}
            وسبب الاسترجاع — وهنرد عليك في أسرع وقت.
          </p>
          <p>
            تقدر تتابع حالة طلبك في أي وقت من{" "}
            <Link href="/track" className="font-semibold text-brand-300 hover:underline">
              صفحة تتبّع الطلب
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
