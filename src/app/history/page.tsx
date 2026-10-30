import type { Metadata } from "next";
import { ProtocolLink, SeasonCard, TotalsStrip, WinnerMark } from "@/app/history/history-ui";
import { DemoBadge } from "@/components/ui";
import { getHistory, showDemoBadge, type HistoryEvening } from "@/lib/data";
import { FORMAT_LABEL, eveningParts, plural } from "@/lib/format";

export const metadata: Metadata = { title: "История · Вечера" };

function EveningRow({ e, open }: { e: HistoryEvening; open: boolean }) {
  const { day, month } = eveningParts(e.startsAt);
  const year = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Vienna", year: "numeric" }).format(
    new Date(e.startsAt),
  );
  const red = e.games.filter((g) => g.winner === "red").length;
  const black = e.games.filter((g) => g.winner === "black").length;

  return (
    <li>
      <details open={open} className="group rounded-card border border-border bg-surface open:border-accent/60">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <span className="flex w-14 shrink-0 flex-col items-center text-center leading-tight">
            <span className="font-display text-3xl font-bold text-accent-text">{day}</span>
            <span className="text-xs text-muted">{month}</span>
            <span className="text-xs text-muted">{year}</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-bold">Игровой вечер №{e.number}</span>
            <span className="mt-1 block text-sm text-muted">
              {e.place} · {e.participants} {plural(e.participants, ["участник", "участника", "участников"])}
            </span>
          </span>
          <span className="flex items-center gap-5 text-sm text-muted">
            <span>
              <span className="font-medium text-text">{e.games.length}</span>{" "}
              {plural(e.games.length, ["партия", "партии", "партий"])}
            </span>
            <span className="inline-flex items-center gap-1.5" title="Победы красных">
              <span aria-hidden className="size-2.5 rounded-full bg-side-red" />
              <span className="sr-only">Победы красных:</span>
              <span className="font-medium text-text">{red}</span>
            </span>
            <span className="inline-flex items-center gap-1.5" title="Победы чёрных">
              <span aria-hidden className="size-2.5 rounded-full bg-side-black" />
              <span className="sr-only">Победы чёрных:</span>
              <span className="font-medium text-text">{black}</span>
            </span>
            <svg
              aria-hidden
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="transition-transform group-open:rotate-180"
            >
              <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </summary>

        <div className="border-t border-border px-4 pb-2 sm:px-5">
          {e.games.length === 0 ? (
            <p className="py-4 text-sm text-muted">Завершённых партий в этот вечер нет.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-3 pr-4 font-normal">№</th>
                    <th scope="col" className="py-3 pr-4 font-normal">Формат</th>
                    <th scope="col" className="py-3 pr-4 font-normal">Победила сторона</th>
                    <th scope="col" className="py-3 pr-4 font-normal">Игроков</th>
                    <th scope="col" className="py-3 font-normal"><span className="sr-only">Протокол</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {e.games.map((g) => (
                    <tr key={g.id}>
                      <td className="py-1 pr-4 tabular-nums">{g.no}</td>
                      <td className="py-1 pr-4">{FORMAT_LABEL[g.format]}</td>
                      <td className="py-1 pr-4"><WinnerMark winner={g.winner} /></td>
                      <td className="py-1 pr-4 tabular-nums">{g.players}</td>
                      <td className="py-1 text-right"><ProtocolLink id={g.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
    </li>
  );
}

export default async function HistoryEveningsPage() {
  const { evenings, seasons, totals } = await getHistory();
  const demo = showDemoBadge();

  return (
    <>
      {demo && (
        <div className="flex justify-end">
          <DemoBadge />
        </div>
      )}
      <TotalsStrip totals={totals} caption="За всё время" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="evenings-title">
          <h2 id="evenings-title" className="mb-4 font-display text-2xl font-bold">
            Игровые вечера
          </h2>
          {evenings.length === 0 ? (
            <p className="text-muted">Проведённых вечеров пока нет.</p>
          ) : (
            <ul className="space-y-3">
              {evenings.map((e, i) => (
                <EveningRow key={e.id} e={e} open={i === 0} />
              ))}
            </ul>
          )}
        </section>

        <aside aria-labelledby="seasons-title">
          <h2 id="seasons-title" className="mb-4 font-display text-2xl font-bold">
            Сезоны клуба
          </h2>
          {seasons.length === 0 ? (
            <p className="text-muted">Сезоны пока не заведены.</p>
          ) : (
            <ul className="space-y-3">
              {seasons.map((s) => (
                <li key={s.id}>
                  <SeasonCard season={s} />
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
