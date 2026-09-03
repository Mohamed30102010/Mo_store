import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { CartProvider } from "@/lib/cart";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/CartDrawer";
import TrackingPixels from "@/components/TrackingPixels";
import { getRewardSettings } from "@/lib/rewards";
import SiteBackground from "@/components/SiteBackground";

// الليّاوت بيعمل استعلام لقاعدة البيانات (نسبة نقاط المكافآت) — لازم يفضل ديناميكي
// عشان Next.js متحاولش تجهّزه بشكل ثابت وقت الـ build (لما الداتابيز مش متاحة أصلاً)
export const dynamic = "force-dynamic";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { percent: rewardPercent } = await getRewardSettings();

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg text-fg antialiased">
        <SiteBackground />
        {/* أكواد التتبّع (بكسلات) — بتتحقن حسب إعدادات لوحة التحكم */}
        <TrackingPixels />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartDrawer rewardPercent={rewardPercent} />
        </CartProvider>
      </body>
    </html>
  );
}
