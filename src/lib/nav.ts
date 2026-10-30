export const NAV_ITEMS = [
  { href: "/", label: "Главная" },
  { href: "/evenings", label: "Вечера" },
  { href: "/players", label: "Игроки" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/history", label: "История" },
  { href: "/learn", label: "Учиться" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
