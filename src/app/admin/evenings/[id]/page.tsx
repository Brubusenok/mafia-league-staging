import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DeleteEveningButton,
  EveningForm,
  SignupAddForm,
  SignupRow,
} from "@/app/admin/evenings/evening-forms";
import { adminEvening, adminPlayers, adminSignups } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { fullDateTime } from "@/lib/format";
import { isUuid } from "@/lib/validate";

export const metadata: Metadata = { title: "Вечер · Админка" };

export default async function AdminEveningPage(props: PageProps<"/admin/evenings/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await props.params;
  if (!isUuid(id)) notFound();

  const [evening, players, signups] = await Promise.all([
    adminEvening(supabase, id),
    adminPlayers(supabase),
    adminSignups(supabase, id),
  ]);
  if (!evening) notFound();

  const options = players.map((p) => ({ id: p.id, name: p.display_name }));
  const signed = new Set(signups.map((s) => s.player_id));
  const candidates = options.filter((p) => !signed.has(p.id));
  const going = signups.filter((s) => s.status === "going" || s.status === "late").length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/evenings" className="inline-flex min-h-11 items-center text-sm text-accent-text hover:underline">
          ← Все вечера
        </Link>
        <h1 className="font-display text-3xl font-bold">{fullDateTime(evening.starts_at)}</h1>
        <p className="mt-2 text-muted">
          Придут: {going} из {evening.capacity}
        </p>
      </div>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-4 font-display text-xl font-bold">О вечере</h2>
        <EveningForm evening={evening} players={options} />
      </section>

      <section className="rounded-card border border-border bg-surface p-5">
        <h2 className="mb-1 font-display text-xl font-bold">Запись на вечер</h2>
        <p className="mb-4 text-sm text-muted">
          «Придут» на сайте считаются со статусами «Придёт» и «Опоздает». Остальное видите только вы.
        </p>
        <SignupAddForm eveningId={evening.id} candidates={candidates} />
        {signups.length > 0 && (
          <ul className="mt-5 space-y-2">
            {signups.map((s) => (
              <SignupRow key={s.player_id} eveningId={evening.id} signup={s} />
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end">
        <DeleteEveningButton id={evening.id} />
      </div>
    </div>
  );
}
