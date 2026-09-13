"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { placeOrderAction, type CheckoutState } from "@/app/actions/checkout";
import { checkCouponAction } from "@/app/actions/coupons";
import { site, shippingCostCents } from "@/lib/site";
import type { BumpOffer } from "@/lib/settings";

type Props = {
  user: { name: string; email: string; phone: string | null } | null;
  bump?: BumpOffer | null;
  bumpChecked?: boolean;
  onBumpChange?: (checked: boolean) => void;
};

const initial: CheckoutState = {};

export default function CheckoutForm({ user, bump, bumpChecked, onBumpChange }: Props) {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    placeOrderAction,
    initial
  );
  const [method, setMethod] = useState<"cash" | "transfer">("cash");
  const [wantAccount, setWantAccount] = useState(false);
  const done = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // ═══ كوبون الخصم ═══
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  async function handleCheckCoupon() {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setCouponError(null);
    const fd = new FormData(formRef.current ?? undefined);
    const phone = String(fd.get("customerPhone") || "").trim();
    const result = await checkCouponAction(couponCode, phone);
    if (result.valid) {
      setCouponResult({ discountPercent: result.discountPercent });
      setCouponError(null);
    } else {
      setCouponResult(null);
      setCouponError(result.error);
    }
    setCouponChecking(false);
  }

  const hasPhysical = items.some((i) => i.type === "physical");
  const itemsJson = JSON.stringify(
    items.map((i) => ({ productId: i.productId, qty: i.qty }))
  );

  useEffect(() => {
    if (state.ok && state.orderNumber && !done.current) {
      done.current = true;
      try { sessionStorage.setItem("just_placed_order", state.orderNumber); } catch {}
      clear();
      router.replace(`/orders/${state.orderNumber}`);
    }
  }, [state, clear, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="items" value={itemsJson} />

      {/* بيانات العميل */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold text-fg">بياناتك</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="الاسم"
            name="customerName"
            defaultValue={user?.name ?? ""}
            required
            placeholder="اسمك بالكامل"
          />
          <Field
            label="الموبايل"
            name="customerPhone"
            defaultValue={user?.phone ?? ""}
            required
            placeholder="01xxxxxxxxx"
            inputMode="tel"
          />
          <Field
            label={`الإيميل ${hasPhysical ? "(اختياري)" : "(للتوصيل الرقمي)"}`}
            name="customerEmail"
            defaultValue={user?.email ?? ""}
            type="email"
            placeholder="you@example.com"
          />
          {hasPhysical && (
            <Field
              label="عنوان التوصيل"
              name="address"
              required
              placeholder="المحافظة، المدينة، الشارع..."
            />
          )}
        </div>

        <label className="mt-4 block text-sm text-muted" htmlFor="note">
          ملاحظات (اختياري)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="أي تفاصيل إضافية للطلب"
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-fg outline-none focus:border-brand-500"
        />

        {!user && (
          <div className="mt-4 rounded-xl border border-line bg-bg p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-fg">
              <input
                type="checkbox"
                name="createAccount"
                checked={wantAccount}
                onChange={(e) => setWantAccount(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              اعمل حساب عشان أتابع طلباتي بعدين
            </label>
            {wantAccount && (
              <div className="mt-3">
                <Field
                  label="كلمة السر"
                  name="password"
                  type="password"
                  placeholder="6 حروف على الأقل"
                  required
                />
                <p className="mt-1 text-xs text-muted">
                  هنستخدم نفس الإيميل والموبايل فوق لحسابك.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* كوبون الخصم */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold text-fg">كود الخصم (اختياري)</h2>
        <div className="flex gap-2">
          <input
            type="text"
            name="couponCode"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponResult(null);
              setCouponError(null);
            }}
            placeholder="اكتب الكود هنا"
            dir="ltr"
            className="flex-1 rounded-xl border border-line bg-bg px-3 py-2.5 text-fg placeholder:text-muted/60 focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCheckCoupon}
            disabled={couponChecking || !couponCode.trim()}
            className="shrink-0 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-2 disabled:opacity-50"
          >
            {couponChecking ? "جارٍ التحقق…" : "تطبيق"}
          </button>
        </div>
        {couponResult && (
          <p className="mt-2 text-sm font-semibold text-emerald-400">
            ✓ الكود صحيح — خصم {couponResult.discountPercent}%
          </p>
        )}
        {couponError && <p className="mt-2 text-sm text-red-300">{couponError}</p>}
      </section>

      {/* طريقة الدفع */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold text-fg">طريقة الدفع</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PayOption
            value="cash"
            current={method}
            onSelect={setMethod}
            title="كاش عند الاستلام"
            desc="تدفع لما توصلك المنتجات"
            icon="💵"
          />
          <PayOption
            value="transfer"
            current={method}
            onSelect={setMethod}
            title="تحويل / محفظة"
            desc="حوّل وارفع صورة الإيصال"
            icon="🏦"
          />
        </div>
        <input type="hidden" name="paymentMethod" value={method} />

        {method === "transfer" && (
          <div className="mt-4 rounded-xl border border-line bg-bg p-4">
            <p className="text-sm font-semibold text-fg">حوّل على:</p>
            <ul className="tnum mt-2 space-y-1 text-sm text-muted">
              <li>
                محفظة: <span className="text-fg">{site.payment.walletNumber}</span>{" "}
                ({site.payment.walletName})
              </li>
              <li>
                إنستاباي: <span className="text-fg">{site.payment.instapay}</span>
              </li>
              <li>
                حساب بنكي: <span className="text-fg">{site.payment.bankAccount}</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-muted">{site.payment.note}</p>

            <label className="mt-4 block text-sm font-medium text-fg" htmlFor="proof">
              صورة إثبات التحويل *
            </label>
            <input
              id="proof"
              name="proof"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-700"
            />
          </div>
        )}
      </section>

      {bump && (
        <label
          className={`relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-all ${
            bumpChecked
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-amber-500/60 bg-amber-500/5 hover:border-amber-400"
          }`}
        >
          <input
            type="checkbox"
            name="bump"
            value="1"
            checked={!!bumpChecked}
            onChange={(e) => onBumpChange?.(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-emerald-500"
          />
          {bump.image && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bump.image} alt={bump.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-fg">{bump.headline}</p>
            {bump.desc && <p className="mt-0.5 text-xs text-muted">{bump.desc}</p>}
            <p className="tnum mt-1 text-sm">
              <span className="font-extrabold text-emerald-400">
                {formatPrice(bump.bumpCents)}
              </span>
              {bump.bumpCents < bump.originalCents && (
                <>
                  <span className="mx-2 text-muted line-through">
                    {formatPrice(bump.originalCents)}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
                    وفّر {Math.round((1 - bump.bumpCents / bump.originalCents) * 100)}%
                  </span>
                </>
              )}
            </p>
          </div>
          {bumpChecked && (
            <span className="absolute left-3 top-3 text-lg" aria-hidden="true">✅</span>
          )}
        </label>
      )}

      {/* الإجمالي + الإرسال */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        {(() => {
          const bumpCents = bump && bumpChecked ? bump.bumpCents : 0;
          const effSubtotal = subtotalCents + bumpCents;
          const effHasPhysical =
            hasPhysical || (bump && bumpChecked && bump.type === "physical");
          const shipping = shippingCostCents(effSubtotal, !!effHasPhysical);
          const discountCents = couponResult
            ? Math.round((effSubtotal * couponResult.discountPercent) / 100)
            : 0;
          const total = effSubtotal - discountCents + shipping;

          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>الإجمالي الفرعي{effHasPhysical ? " + الشحن" : ""}</span>
                <span className="tnum">{formatPrice(effSubtotal + shipping)}</span>
              </div>
              {discountCents > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-400">
                  <span>خصم الكوبون ({couponResult?.discountPercent}%)</span>
                  <span className="tnum">-{formatPrice(discountCents)}</span>
                </div>
              )}
              <div className="mt-1 flex items-center justify-between border-t border-line pt-2 text-fg">
                <span className="font-semibold">الإجمالي النهائي</span>
                <span className="tnum text-xl font-extrabold">{formatPrice(total)}</span>
              </div>
            </div>
          );
        })()}

        {state.error && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || items.length === 0}
          className="mt-4 w-full rounded-xl bg-brand-gradient px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-brand-600/25 transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "جاري تأكيد الطلب…" : "أكّد الطلب"}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          بتأكيد الطلب هيتسجّل عندنا وتقدر تتابع حالته برقمه.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: "tel" | "text" | "email";
}) {
  return (
    <div>
      <label className="block text-sm text-muted" htmlFor={name}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-fg outline-none focus:border-brand-500"
      />
    </div>
  );
}

function PayOption({
  value,
  current,
  onSelect,
  title,
  desc,
  icon,
}: {
  value: "cash" | "transfer";
  current: string;
  onSelect: (v: "cash" | "transfer") => void;
  title: string;
  desc: string;
  icon: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex items-center gap-3 rounded-xl border p-4 text-right transition-colors ${
        active
          ? "border-brand-500 bg-brand-600/10"
          : "border-line bg-bg hover:border-brand-600/50"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="flex flex-col">
        <span className="font-bold text-fg">{title}</span>
        <span className="text-xs text-muted">{desc}</span>
      </span>
      <span
        className={`ms-auto grid h-5 w-5 place-items-center rounded-full border ${
          active ? "border-brand-500 bg-brand-500" : "border-line"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}
