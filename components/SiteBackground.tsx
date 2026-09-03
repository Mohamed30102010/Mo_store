// خلفية الموقع المتحركة — عدّل القيمة دي بس لما يبقى عندك الملف/الرابط
// سيبها فاضية "" عشان الخلفية العادية (بدون حركة) تفضل شغالة
const BACKGROUND_SRC = "Animate_luxury_logo_reveal_202609040322.mp4";

export default function SiteBackground() {
  if (!BACKGROUND_SRC) return null;

  const isVideo = /\.(mp4|webm)$/i.test(BACKGROUND_SRC);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {isVideo ? (
        <video
          src={BACKGROUND_SRC}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-40"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BACKGROUND_SRC}
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
      )}
      {/* طبقة سودة شفافة فوق الخلفية عشان النصوص تفضل واضحة */}
      <div className="absolute inset-0 bg-bg/70" />
    </div>
  );
      }
