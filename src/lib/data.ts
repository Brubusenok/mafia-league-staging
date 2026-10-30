import { cacheLife, cacheTag } from "next/cache";
import { DEMO_EVENING, DEMO_RECENT_GAMES, DEMO_TOP_PLAYERS, DEMO_LEAGUE_STATS } from "@/lib/demo";
import { FORMAT_LABEL, eveningParts, shortDate } from "@/lib/format";
import { computeStats, type FinishedGame, type PlayerStats, type Role, type Winner } from "@/lib/rating";
import { getPublicClient } from "@/lib/supabase";

/** Показывать ли пометку «Демонстрационные данные». Выключите, когда внесёте настоящих игроков. */
export function showDemoBadge() {
  return !getPublicClient() || process.env.NEXT_PUBLIC_SHOW_DEMO_BADGE === "true";
}

export type Player = {
  id: string;
  name: string;
  status: "club_member" | "newbie";
};

export type RatedPlayer = Player & PlayerStats;

export type NextEvening = {
  id: string | null; // null — демо-режим без базы
  weekday: string;
  day: string;
  month: string;
  time: string;
  place: string;
  capacity: number;
  signedUp: number;
  hostName: string | null;
  participants: string[];
};

export type RecentGame = { id: string; date: string; format: string; status: string };

function check<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error || res.data === null) {
    throw new Error(`Не удалось загрузить ${what}: ${res.error?.message ?? "нет данных"}`);
  }
  return res.data;
}

async function loadPlayers(): Promise<Player[]> {
  const db = getPublicClient();
  if (!db) return [];
  const rows = check(
    await db.from("players").select("id, display_name, status").order("display_name"),
    "игроков",
  );
  return rows.map((r) => ({ id: r.id, name: r.display_name, status: r.status }));
}

async function loadFinishedGames() {
  const db = getPublicClient();
  if (!db) return [];
  const rows = check(
    await db
      .from("games")
      .select("id, winner, format, finished_at, evenings(starts_at), game_players(player_id, role)")
      .eq("status", "finished")
      .order("finished_at", { ascending: false }),
    "партии",
  );
  return rows.map((g) => {
    const ev = Array.isArray(g.evenings) ? g.evenings[0] : g.evenings;
    return {
      id: g.id as string,
      format: g.format as keyof typeof FORMAT_LABEL,
      date: (g.finished_at ?? ev?.starts_at) as string,
      game: {
        winner: g.winner as Winner,
        players: g.game_players as { player_id: string; role: Role }[],
      } satisfies FinishedGame,
    };
  });
}

/** Игроки с рейтингом, лучшие сверху. */
export async function getRating(): Promise<RatedPlayer[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  const [players, games] = await Promise.all([loadPlayers(), loadFinishedGames()]);
  const stats = computeStats(players.map((p) => p.id), games.map((g) => g.game));
  return players
    .map((p) => ({ ...p, ...stats.get(p.id)! }))
    .sort((a, b) => b.rating - a.rating || b.games - a.games || a.name.localeCompare(b.name, "ru"));
}

export async function getNextEvening(): Promise<NextEvening | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  const db = getPublicClient();
  if (!db) {
    return { ...DEMO_EVENING, id: null, hostName: "Игрок 11" };
  }

  const rows = check(
    await db
      .from("evenings")
      .select("id, starts_at, place, capacity, host:players!evenings_host_player_id_fkey(display_name)")
      .eq("status", "planned")
      .order("starts_at", { ascending: true })
      .limit(1),
    "ближайший вечер",
  );
  const ev = rows[0];
  if (!ev) return null;

  const [signups, players] = await Promise.all([
    db.from("evening_participants").select("player_id").eq("evening_id", ev.id),
    loadPlayers(),
  ]);
  const ids = new Set(check(signups, "участников").map((s) => s.player_id));
  const names = players.filter((p) => ids.has(p.id)).map((p) => p.name);
  const host = Array.isArray(ev.host) ? ev.host[0] : ev.host;

  return {
    id: ev.id as string,
    ...eveningParts(ev.starts_at),
    place: ev.place,
    capacity: ev.capacity,
    signedUp: names.length,
    hostName: host?.display_name ?? null,
    participants: names,
  };
}

export async function getRecentGames(limit = 3): Promise<RecentGame[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  if (!getPublicClient()) {
    return DEMO_RECENT_GAMES.map((g, i) => ({ id: String(i), ...g }));
  }
  const games = await loadFinishedGames();
  return games.slice(0, limit).map((g) => ({
    id: g.id,
    date: shortDate(g.date),
    format: FORMAT_LABEL[g.format],
    status: "Игра завершена",
  }));
}

export async function getLeagueStats(): Promise<{ value: string; label: string }[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  const db = getPublicClient();
  if (!db) return DEMO_LEAGUE_STATS;

  const [players, evenings, games] = await Promise.all([
    db.from("players").select("id", { count: "exact", head: true }),
    db.from("evenings").select("id", { count: "exact", head: true }).eq("status", "finished"),
    db.from("games").select("id", { count: "exact", head: true }).eq("status", "finished"),
  ]);
  return [
    { value: String(players.count ?? 0), label: "Игроков" },
    { value: String(evenings.count ?? 0), label: "Проведено вечеров" },
    { value: String(games.count ?? 0), label: "Сыграно партий" },
  ];
}

export async function getTopPlayers(limit = 3): Promise<{ place: number; name: string; rating: number }[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  if (!getPublicClient()) return DEMO_TOP_PLAYERS;
  const rated = await getRating();
  return rated
    .filter((p) => p.games > 0)
    .slice(0, limit)
    .map((p, i) => ({ place: i + 1, name: p.name, rating: p.rating }));
}
