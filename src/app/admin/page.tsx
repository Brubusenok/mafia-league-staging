import type { Metadata } from "next";
import Link from "next/link";
import { adminCounts } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Обзор · Админка" };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const c = await adminCounts(supabase);

  const stats = [
    { label: "Игроков", value: c.players, href: "/admin/players" },
    { label: "Вечеров", value: c.evenings, href: "/admin/evenings" },
    { label: "Партий", value: c.games },
    { label: "Идут сейчас", value: c.playing },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Обзор клуба</h1>
        <p className="mt-2 text-muted">Вы вошли как администратор.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="rounded-card border border-border bg-surface p-5">
            <p className="font-display text-4xl leading-none font-bold">{s.value}</p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
            {s.href && (
              <Link href={s.href} className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-text hover:underline">
                Открыть →
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Ввод результатов партий появится на следующем этапе.
      </p>
    </div>
  );
}
