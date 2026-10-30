import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = { title: "Вход", robots: { index: false } };

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl font-bold">Вход</h1>
      <p className="mt-3 text-muted">Для организаторов клуба.</p>
      <div className="mt-8 rounded-card border border-border bg-surface p-6">
        {/* Читаем ?error=... во время запроса, поэтому оборачиваем в Suspense. */}
        <Suspense fallback={<LoginForm forbidden={false} />}>
          <LoginFormWithParams searchParams={props.searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const params = await searchParams;
  return <LoginForm forbidden={params.error === "forbidden"} />;
}
