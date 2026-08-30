"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initial
  );
  const [regState, regFormAction, regPending] = useActionState(
    registerAction,
    initial
  );

  const isLogin = mode === "login";
  const state = isLogin ? loginState : regState;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      {/* التبويبات */}
      <div className="mb-6 grid grid-cols-2 rounded-xl border border-line bg-bg p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-lg py-2 text-sm font-bold transition-colors ${
            isLogin ? "bg-brand-gradient text-white" : "text-muted"
          }`}
        >
          دخول
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-lg py-2 text-sm font-bold transition-colors ${
            !isLogin ? "bg-brand-gradient text-white" : "text-muted"
          }`}
        >
          حساب جديد
        </button>
      </div>

      {isLogin ? (
        <form action={loginFormAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={next} />
          <Field label="الإيميل" name="email" type="email" required placeholder="you@example.com" />
          <Field label="كلمة السر" name="password" type="password" required placeholder="••••••" />
          {state.error && <ErrorBox msg={state.error} />}
          <Submit pending={loginPending} label="دخول" />
        </form>
      ) : (
        <form action={regFormAction} className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={next} />
          <Field label="الاسم" name="name" required placeholder="اسمك بالكامل" />
          <Field label="الإيميل" name="email" type="email" required placeholder="you@example.com" />
          <Field label="الموبايل (اختياري)" name="phone" inputMode="tel" placeholder="01xxxxxxxxx" />
          <Field label="كلمة السر" name="password" type="password" required placeholder="6 حروف على الأقل" />
          {state.error && <ErrorBox msg={state.error} />}
          <Submit pending={regPending} label="إنشاء الحساب" />
        </form>
      )}

      <p className="mt-4 text-center text-xs text-muted">
        بتسجيلك بتوافق على إن بياناتك تتخزّن عندنا لمتابعة طلباتك.{" "}
        <Link href="/" className="text-brand-300 hover:underline">
          رجوع للمتجر
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
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
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-fg outline-none focus:border-brand-500"
      />
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
      {msg}
    </p>
  );
}

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-brand-gradient px-6 py-3 font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "لحظة…" : label}
    </button>
  );
}
