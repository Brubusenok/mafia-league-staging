import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/app/register/register-form";

export const metadata: Metadata = { title: "Регистрация", robots: { index: false } };

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl font-bold">Регистрация</h1>
      <p className="mt-3 text-muted">
        Чтобы записываться на игровые вечера. Играть можно и без регистрации.
      </p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6">
        <RegisterForm />
      </div>
      <p className="mt-5 text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-accent-text hover:underline">
          Войти
        </Link>
      </p>
    </section>
  );
}
