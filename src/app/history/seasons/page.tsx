import type { Metadata } from "next";
import { TotalsStrip, seasonPeriod } from "@/app/history/history-ui";
import { DemoBadge } from "@/components/ui";
import { getHistory, showDemoBadge } from "@/lib/data";

export const metadata: Metadata = { title: "История · Сезоны" };

export default async function HistorySeasonsPage() {
  const { seasons, evenings } = await getHistory();
  const demo = showDemoBadge();
  const withoutSeason = evenings.filter((e) => !e.seasonId).length;

  return (
    <>
      {demo && (
        <div className="flex justify-end">
          <DemoBadge />
        </div>
      )}
      {seasons.length === 0 ? (
        <p className="text-muted">Сезоны пока не заведены.</p>
      ) : (
        seasons.map((s) => (
          <section key={s.id} aria-label={s.name} className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-2xl font-bold">{s.name}</h2>
              <span className="text-muted">{seasonPeriod(s)}</span>
              {!s.endsOn && (
                <span className="rounded-full border border-accent/50 px-2.5 py-0.5 text-xs text-accent-text">
                  Текущий сезон
                </span>
              )}
            </div>
            <TotalsStrip totals={s} caption="Сводка сезона" />
          </section>
        ))
      )}
      {withoutSeason > 0 && (
        <p className="text-sm text-muted">
          Вечеров без сезона: {withoutSeason}. Они видны во вкладке «Вечера», но не входят в сводки сезонов.
        </p>
      )}
    </>
  );
}
