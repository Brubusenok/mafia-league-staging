import Link from "next/link";
import { Logo } from "@/components/logo";
import { NAV_ITEMS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted">
            Сообщество любителей спортивной Мафии в Граце. Новичкам всегда рады.
          </p>
        </div>
        <nav aria-label="Навигация в подвале">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm text-muted">
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © Mafia League · Грац, Австрия
      </div>
    </footer>
  );
}
