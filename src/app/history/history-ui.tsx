import Link from "next/link";
import type { HistoryTotals, SeasonSummary } from "@/lib/data";
import { WINNER_SHORT, monthYear, plural } from "@/lib/format";
import type { Winner } from "@/lib/rating";

/** Победившая сторона: цветная метка и подпись (цвет не единственный признак). */
export function WinnerMark({ winner }: { winner: Winner }) {
  const dot =
    winner === "red" ? "bg-side-red" : winner === "black" ? "bg-side-black" : "border border-muted";
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${dot}`} />
      {WINNER_SHORT[winner]}
    </span>
  );
}

function share(part: number, total: number) {
  return total > 0 ? ` (${Math.round((part / total) * 100)}%)` : "";
}

/** Сводка: вечера, партии, участники, победы красных и чёрных. */
export function TotalsStrip({ totals, caption }: { totals: HistoryTotals; caption: string }) {
  const decided = totals.redWins + totals.blackWins;
  const items = [
    { value: totals.evenings, label: plural(totals.evenings, ["игровой вечер", "игровых вечера", "игровых вечеров"]) },
    { value: totals.games, label: plural(totals.games, ["партия", "партии", "партий"]) },
    { value: totals.players, label: plural(totals.players, ["участник", "участника", "участников"]) },
    {
      value: totals.redWins,
      label: `${plural(totals.redWins, ["победа", "победы", "побед"])} красных${share(totals.redWins, decided)}`,
      dot: "bg-side-red",
    },
    {
      value: totals.blackWins,
      label: `${plural(totals.blackWins, ["победа", "победы", "побед"])} чёрных${share(totals.blackWins, decided)}`,
      dot: "bg-side-black",
    },
  ];
  return (
    <section aria-label="Сводка" className="rounded-card border border-border bg-surface p-5">
      <p className="mb-4 text-sm text-muted">{caption}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col-reverse">
            <dt className="flex items-center gap-2 text-sm text-muted">
              {it.dot && <span aria-hidden className={`size-2.5 rounded-full ${it.dot}`} />}
              {it.label}
            </dt>
            <dd className="font-display text-3xl font-bold tabular-nums">{it.value}</dd>
          </div>
        ))}
      </dl>
      {totals.draws > 0 && (
        <p className="mt-4 text-sm text-muted">
          Ничьих: {totals.draws}. Проценты считаются только по партиям с победителем.
        </p>
      )}
    </section>
  );
}

export function seasonPeriod(s: SeasonSummary) {
  return `${monthYear(s.startsOn)} — ${s.endsOn ? monthYear(s.endsOn) : "сейчас"}`;
}

/** Карточка сезона. Сезон без даты окончания считается текущим. */
export function SeasonCard({ season }: { season: SeasonSummary }) {
  const current = !season.endsOn;
  return (
    <article
      className={`rounded-panel border p-4 ${current ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
    >
      {current && (
        <span className="mb-2 inline-flex rounded-full border border-accent/50 px-2.5 py-0.5 text-xs text-accent-text">
          Текущий сезон
        </span>
      )}
      <h3 className="font-display text-lg font-bold">{season.name}</h3>
      <p className="text-sm text-muted">{seasonPeriod(season)}</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        {[
          [season.evenings, plural(season.evenings, ["вечер", "вечера", "вечеров"])],
          [season.games, plural(season.games, ["партия", "партии", "партий"])],
          [season.players, plural(season.players, ["игрок", "игрока", "игроков"])],
        ].map(([value, label]) => (
          <div key={label} className="flex flex-col-reverse">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function ProtocolLink({ id }: { id: string }) {
  return (
    <Link
      href={`/history/games/${id}`}
      className="inline-flex min-h-11 items-center whitespace-nowrap text-accent-text hover:underline"
    >
      Протокол →
    </Link>
  );
}
