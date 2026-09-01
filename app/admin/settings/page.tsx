import { prisma } from "@/lib/prisma";
import { getSettings, isOn } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = { title: "الإعدادات" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, products] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, priceCents: true, currency: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-fg">⚙️ الإعدادات</h2>
        <p className="text-sm text-muted">
          البكسلات والتتبّع + العرض الإضافي + نقاط المكافآت.
        </p>
      </div>

      <SettingsForm
        settings={settings}
        pixelStates={{
          meta: isOn(settings.meta_pixel_enabled),
          tiktok: isOn(settings.tiktok_pixel_enabled),
          ga: isOn(settings.ga_enabled),
          snap: isOn(settings.snap_pixel_enabled),
          bump: isOn(settings.bump_enabled),
        }}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          priceLabel: formatPrice(p.priceCents, p.currency),
        }))}
      />
    </div>
  );
}
