"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/history", label: "Вечера" },
  { href: "/history/games", label: "Партии" },
  { href: "/history/seasons", label: "Сезоны" },
] as const;

function isTabActive(pathname: string, href: string) {
  return href === "/history" ? pathname === "/history" : pathname.startsWith(href);
}

export function HistoryTabs() {
  return <TabList pathname={usePathname()} />;
}

/** Без подсветки (pathname = null) — заглушка, пока адрес страницы ещё неизвестен. */
export function TabList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Разделы истории" className="mt-8">
      <ul className="inline-flex rounded-control border border-border bg-surface p-1">
        {TABS.map(({ href, label }) => {
          const active = pathname !== null && isTabActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-[8px] px-5 text-sm transition-colors sm:px-8 ${
                  active ? "bg-accent text-text" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
