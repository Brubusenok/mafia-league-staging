import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        {/* Заглушка вместо фото: тёмный фон с красным свечением. */}
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
            <Link
              href="/evenings"
              className="inline-flex h-12 items-center justify-center rounded-control bg-accent px-6 font-medium transition-colors hover:bg-accent-hover"
            >
              Записаться на вечер
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-12 items-center justify-center rounded-control border border-border px-6 font-medium transition-colors hover:border-accent-text"
            >
              Я новичок — как начать?
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        <Card title="Ближайший игровой вечер">
          Здесь появится дата, формат игры и число записавшихся.
        </Card>
        <Card title="О клубе">
          Мы играем по правилам спортивной Мафии, встречаем новичков и помогаем
          учиться.
        </Card>
        <Card title="Формат игры">
          Классика 10 — 10 игроков и ведущий. Short9 — 9 игроков и ведущий.
        </Card>
      </section>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-3 text-muted">{children}</p>
      <p className="mt-4 text-xs text-accent-text">Демонстрационные данные</p>
    </div>
  );
}
