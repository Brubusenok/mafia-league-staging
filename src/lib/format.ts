const TZ = "Europe/Vienna";

/** Разбирает дату вечера для показа: «Сб», «15», «марта», «19:00». */
export function eveningParts(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("ru-RU", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "long",
  }).formatToParts(d);
  const get = (type: string) => date.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: get("day"),
    month: get("month"),
    time: new Intl.DateTimeFormat("ru-RU", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
    }).format(d),
  };
}

/** «8 марта» */
export function shortDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export const FORMAT_LABEL = {
  classic10: "Классика 10",
  short9: "Short9",
} as const;

export const STATUS_LABEL = {
  club_member: "Игрок клуба",
  newbie: "Новичок",
} as const;
