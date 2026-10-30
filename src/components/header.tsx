"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { NAV_ITEMS, isActive } from "@/lib/nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Меню закрывается по клавише Escape и при выборе пункта.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Основная навигация" className="hidden h-full lg:block">
          <ul className="flex h-full items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="h-full">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-full items-center px-4 text-sm transition-colors hover:text-text ${
                      active ? "text-text" : "text-muted"
                    }`}
                  >
                    {label}
                    {active && (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden h-11 items-center rounded-control bg-accent px-5 text-sm font-medium transition-colors hover:bg-accent-hover sm:inline-flex"
          >
            Войти
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-control border border-border bg-surface lg:hidden"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Мобильная навигация"
          className="border-t border-border bg-canvas lg:hidden"
        >
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                    className={`flex min-h-12 items-center border-l-2 px-4 text-base ${
                      active
                        ? "border-accent text-text"
                        : "border-transparent text-muted hover:text-text"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="py-3">
              <Link
                href="/login"
                onClick={close}
                className="flex h-12 items-center justify-center rounded-control bg-accent font-medium hover:bg-accent-hover"
              >
                Войти
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
