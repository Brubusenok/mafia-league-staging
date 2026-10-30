"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Step = { title: string; text: string; answer: ReactNode };

// Общепринятые правила спортивной Мафии (по регламенту ФИИМ). Детали клуба уточняет ведущий.
const STEPS: Step[] = [
  {
    title: "Что такое спортивная Мафия?",
    text: "Коротко о формате, клубе и чем он отличается.",
    answer: (
      <>
        <p>
          Командная игра на логику, внимание и умение убеждать. Две команды:{" "}
          <b className="text-text">красные</b> (мирные жители и шериф) и{" "}
          <b className="text-text">чёрные</b> (мафия и дон). Красные не знают, кто есть кто, чёрные знают
          друг друга.
        </p>
        <p>От «домашней» мафии спортивную отличает строгий регламент:</p>
        <ul>
          <li>у каждого ровно минута на речь, говорят по очереди, по номерам мест;</li>
          <li>за нарушения (речь не в свою минуту, лишние жесты) дают фолы;</li>
          <li>ночью все закрывают глаза, чаще всего надевают маски;</li>
          <li>игру ведёт ведущий: он не играет, объявляет фазы, следит за временем и фолами.</li>
        </ul>
        <p>
          В нашем клубе два формата: <b className="text-text">Классика 10</b> (10 игроков) и{" "}
          <b className="text-text">Short9</b> (9 игроков). Ведущий в обоих — отдельный человек.
        </p>
      </>
    ),
  },
  {
    title: "Роли и правила",
    text: "Кто есть кто и как мы играем (без сложностей).",
    answer: (
      <>
        <p>
          В «Классике 10» за столом 6 мирных, шериф, дон и 2 мафии. В Short9 — 5 мирных, шериф, дон и 2
          мафии. Роль каждый тянет тайно, картой.
        </p>
        <ul>
          <li>
            <b className="text-text">Мирный</b> — ночью спит. Его оружие — внимание к речам и голосованиям.
          </li>
          <li>
            <b className="text-text">Шериф</b> — каждую ночь проверяет одного игрока, и ведущий молча
            показывает: красный он или чёрный.
          </li>
          <li>
            <b className="text-text">Мафия</b> — знает своих и ночью вместе с доном «стреляет».
          </li>
          <li>
            <b className="text-text">Дон</b> — глава мафии. Ночью ищет шерифа.
          </li>
        </ul>
        <p>
          <b className="text-text">Победа.</b> Красные выигрывают, когда за столом не осталось чёрных.
          Чёрные — когда их становится столько же, сколько красных.
        </p>
        <p>
          <b className="text-text">Фолы.</b> Их дают за речь не в свою минуту, подсказки, лишнюю
          жестикуляцию, подглядывание ночью. После четвёртого фола игрок покидает стол.
        </p>
      </>
    ),
  },
  {
    title: "Как проходит партия",
    text: "Этапы, тайминги и что происходит за столом.",
    answer: (
      <ol>
        <li>
          <b className="text-text">Раздача ролей.</b> Каждый тайно смотрит свою карту.
        </li>
        <li>
          <b className="text-text">Первая ночь — договорка.</b> Чёрные открывают глаза, знакомятся и
          около минуты молча договариваются жестами. В эту ночь никто не выбывает.
        </li>
        <li>
          <b className="text-text">День.</b> Игроки по очереди говорят ровно минуту: делятся
          подозрениями и могут выставить кого-то на голосование. Потом голосуют.
        </li>
        <li>
          <b className="text-text">Ночь.</b> Мафия «стреляет»: все чёрные жестом показывают один номер.
          Если номера разные — промах. Затем дон ищет шерифа, а шериф проверяет игрока.
        </li>
        <li>
          <b className="text-text">Утро.</b> Ведущий объявляет, кто выбыл ночью. Выбывший говорит
          последнее слово — тоже минуту.
        </li>
        <li>
          День и ночь чередуются, пока одна из команд не победит. Партия обычно длится 40–60 минут.
        </li>
      </ol>
    ),
  },
  {
    title: "Голосование и первый игровой вечер",
    text: "Как принимать решения и чего ожидать на встрече.",
    answer: (
      <>
        <p>
          <b className="text-text">Голосование.</b>
        </p>
        <ul>
          <li>Выставить можно только во время своей речи и только одного игрока за день.</li>
          <li>Ведущий называет кандидатов по порядку, игроки голосуют поднятой рукой — один раз.</li>
          <li>Кто не проголосовал, тот отдаёт голос за последнего кандидата.</li>
          <li>
            Если голосов поровну, кандидаты по 30 секунд оправдываются, и стол голосует снова. При новой
            ничьей решают, выбывают ли все они сразу.
          </li>
          <li>Выбывший по голосованию говорит последнее слово.</li>
        </ul>
        <p>
          <b className="text-text">Первый вечер.</b>
        </p>
        <ul>
          <li>Запишитесь на вечер на этом сайте, в разделе «Вечера».</li>
          <li>Приходите к началу: ведущий коротко объяснит правила перед первой партией.</li>
          <li>Можно сначала посмотреть одну партию со стороны — это нормально.</li>
          <li>Не бойтесь ошибиться: новичкам подскажут, а фолы — часть обучения.</li>
        </ul>
      </>
    ),
  },
];

/** Четыре шага: нажатие открывает ответ под карточками, другой шаг заменяет его. */
export function NewbiePath() {
  const [open, setOpen] = useState<number | null>(null);
  const step = open === null ? null : STEPS[open];
  const answerRef = useRef<HTMLDivElement>(null);

  // На телефоне ответ оказывается ниже всех карточек — плавно докручиваем до него.
  useEffect(() => {
    if (open === null) return;
    const el = answerRef.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight - 120) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
  }, [open]);

  return (
    <>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const active = open === i;
          return (
            <li key={s.title}>
              <button
                type="button"
                aria-expanded={active}
                aria-controls="newbie-answer"
                onClick={() => setOpen(active ? null : i)}
                className={`flex h-full w-full flex-col rounded-card border p-5 text-left transition-colors duration-300 ${
                  active ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-accent-text"
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full border text-sm transition-colors duration-300 ${
                      active ? "border-accent bg-accent text-text" : "border-accent-text text-accent-text"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <svg
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className={`text-muted transition-transform duration-300 ${active ? "rotate-180" : ""}`}
                  >
                    <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="mt-3 font-display text-lg font-bold">{s.title}</span>
                <span className="mt-2 text-sm text-muted">{s.text}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div id="newbie-answer" ref={answerRef} aria-live="polite" className="scroll-mt-20">
        {step && (
          // key заставляет анимацию проигрываться заново при смене шага.
          <div
            key={open}
            className="mt-4 motion-safe:animate-reveal rounded-card border border-accent/50 bg-surface p-5 sm:p-6"
          >
            <h3 className="font-display text-xl font-bold">
              {open! + 1}. {step.title}
            </h3>
            <div className="mt-3 max-w-3xl space-y-3 text-muted [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
              {step.answer}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
