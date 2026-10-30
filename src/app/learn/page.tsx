import type { Metadata } from "next";
import { ButtonLink, Card, PageHero } from "@/components/ui";
import { TableDiagram } from "@/components/table-diagram";
import { NewbiePath } from "@/app/learn/newbie-path";

export const metadata: Metadata = { title: "Обучение" };

const MATERIALS = [
  { title: "Основы", text: "Правила, роли, формат, частые вопросы." },
  { title: "Практика", text: "Разбор ситуаций и типичных ошибок." },
  { title: "Для опытных", text: "Углублённые материалы и тактические темы." },
];

export default function LearnPage() {
  return (
    <>
      <PageHero
        title="Научись играть в Мафию"
        subtitle="Никогда не играл? Начни с основ — мы поможем."
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
        <Card className="border-accent/50 bg-accent/5">
          <h2 className="font-display text-3xl font-bold">Новичкам</h2>
          <p className="mt-1 text-muted">Правила, роли и первые шаги</p>
          <p className="mt-4 max-w-2xl text-muted">
            Короткий и понятный курс, который поможет разобраться в спортивной
            Мафии и уверенно прийти на свой первый игровой вечер.
          </p>
          <p className="mt-5 text-sm text-accent-text">
            Начните с «Пути новичка» ниже.
          </p>
        </Card>

        <section aria-labelledby="path">
          <h2 id="path" className="font-display text-2xl font-bold">
            Путь новичка
          </h2>
          <p className="mt-1 text-muted">
            Четыре коротких урока — и вы готовы к первой игре. Нажмите на шаг, чтобы открыть его.
          </p>
          <NewbiePath />
        </section>

        <Card>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl font-bold">Как устроен игровой стол</h2>
              <p className="mt-3 text-muted">
                Классический формат нашего клуба — <b className="text-text">Классика 10</b>:
                10 игроков и отдельный ведущий. Есть также формат{" "}
                <b className="text-text">Short9</b>: 9 игроков и отдельный ведущий.
              </p>
            </div>
            <div className="flex justify-center">
              <TableDiagram seats={10} />
            </div>
          </div>
        </Card>

        <section aria-labelledby="choose">
          <h2 id="choose" className="font-display text-2xl font-bold">
            Выбери, что изучать
          </h2>
          <p className="mt-1 text-muted">
            Материалы подходят для любого уровня. Доступны без регистрации.
          </p>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {MATERIALS.map((m) => (
              <li key={m.title} className="rounded-card border border-border bg-surface p-5">
                <h3 className="font-display text-lg font-bold">{m.title}</h3>
                <p className="mt-2 text-sm text-muted">{m.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-card border border-dashed border-accent/60 p-5 sm:p-6">
          <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs text-accent-text">
            Концепция
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold">Попробуй свои силы</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Интерактивные учебные ситуации — в разработке. Скоро здесь можно будет
            принимать решения, разбирать их и лучше понимать игру.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Приходи на игровой вечер в Граце</h2>
            <p className="mt-2 max-w-xl text-muted">
              Лучший способ научиться — сыграть вживую. Мы всегда рады новым
              игрокам, даже если вы ещё не изучили весь курс.
            </p>
          </div>
          <ButtonLink href="/evenings">Ближайшая встреча</ButtonLink>
        </div>
      </div>
    </>
  );
}
