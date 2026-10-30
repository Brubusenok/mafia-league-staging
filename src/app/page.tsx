import Link from "next/link";
import {
  DEMO_EVENING,
  DEMO_FORMATS,
  DEMO_LEAGUE_STATS,
  DEMO_RECENT_GAMES,
  DEMO_TOP_PLAYERS,
} from "@/lib/demo";
import { Avatar, ButtonLink, Card } from "@/components/ui";

export default function Home() {
  const e = DEMO_EVENING;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        {/* Вместо фото — тёмный фон с красным свечением. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(170,35,53,0.35),transparent_60%),radial-gradient(ellipse_at_10%_100%,rgba(170,35,53,0.15),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="max-w-3xl font-display text-4xl leading-tight font-bold sm:text-6xl">
            Мафия объединяет в Граце
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Регулярные игровые вечера, дружеское сообщество и развитие через игру.
            Добро пожаловать!
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/evenings">Записаться на вечер</ButtonLink>
            <ButtonLink href="/learn" variant="outline">
              Я новичок — как начать?
            </ButtonLink>
          </div>
          <ul className="mt-8 grid max-w-3xl gap-3 text-sm text-muted sm:grid-cols-3">
            <li>Дружеская атмосфера</li>
            <li>Играем по правилам спортивной Мафии</li>
            <li>Новичкам всегда рады</li>
          </ul>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <Card title="Ближайший игровой вечер" demo>
          <div className="flex gap-4">
            <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-card border border-border bg-elevated">
              <span className="text-xs text-muted">{e.weekday}</span>
              <span className="font-display text-3xl leading-none font-bold">{e.day}</span>
              <span className="text-xs text-muted">{e.month}</span>
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{e.format}</p>
              <p className="mt-1 text-sm text-muted">
                {e.capacity} игроков + отдельный ведущий
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            <li>
              <span className="font-medium text-text">{e.signedUp} из {e.capacity}</span> уже записались
            </li>
            {e.hostConfirmed && <li>Ведущий подтверждён</li>}
            {e.newbiesWelcome && <li>Новичкам можно прийти</li>}
          </ul>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/evenings">Записаться на вечер</ButtonLink>
          </div>
        </Card>

        <Card title="О клубе">
          <p className="text-muted">
            MAFIA LEAGUE — сообщество любителей спортивной Мафии в Граце. Мы
            регулярно проводим игровые вечера, встречаем новичков, помогаем
            учиться и развиваться и создаём атмосферу, в которой хочется
            возвращаться.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-accent-text hover:underline"
          >
            Узнать больше о клубе →
          </Link>
        </Card>

        <Card title="Формат игры">
          <ul className="grid gap-3 sm:grid-cols-2">
            {DEMO_FORMATS.map((f, i) => (
              <li
                key={f.name}
                className={`rounded-panel border p-4 ${
                  i === 0 ? "border-accent-text" : "border-border"
                }`}
              >
                <p className="font-medium">{f.name}</p>
                <p className="mt-1 text-sm text-muted">{f.players}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Классический формат с 10 игроками — оптимальный баланс игры, динамики
            и общения.
          </p>
        </Card>

        <Card title="Последние игры" demo>
          <ul className="divide-y divide-border text-sm">
            {DEMO_RECENT_GAMES.map((g) => (
              <li key={g.date} className="flex items-center justify-between gap-3 py-3">
                <span className="text-muted">{g.date}</span>
                <span className="font-medium">{g.format}</span>
                <span className="text-muted">{g.status}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Топ игроков" demo>
          <ul className="space-y-3">
            {DEMO_TOP_PLAYERS.map((p) => (
              <li key={p.place} className="flex items-center gap-3">
                <span className="w-5 text-center font-display text-lg text-accent-text">
                  {p.place}
                </span>
                <Avatar name={p.name} />
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="tabular-nums text-muted">{p.rating}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/rating"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-accent-text hover:underline"
          >
            Весь рейтинг →
          </Link>
        </Card>

        <Card title="Лига в цифрах" demo>
          <ul className="grid grid-cols-3 gap-3">
            {DEMO_LEAGUE_STATS.map((s) => (
              <li key={s.label}>
                <p className="font-display text-3xl leading-none font-bold">{s.value}</p>
                <p className="mt-2 text-xs text-muted">{s.label}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
