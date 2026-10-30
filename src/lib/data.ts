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

// ------------------------------------------------------------------ история

export type HistoryGame = {
  id: string;
  no: number;
  format: keyof typeof FORMAT_LABEL;
  winner: Winner;
  players: number;
};

export type HistoryEvening = {
  id: string;
  number: number; // порядковый номер вечера в клубе, с 1
  startsAt: string;
  place: string;
  seasonId: string | null;
  participants: number; // разных игроков за столом за вечер
  games: HistoryGame[];
};

export type SeasonSummary = {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string | null;
  evenings: number;
  games: number;
  players: number;
  redWins: number;
  blackWins: number;
  draws: number;
};

export type HistoryTotals = Omit<SeasonSummary, "id" | "name" | "startsOn" | "endsOn">;

function summarize(evenings: HistoryEvening[], playerIds: Map<string, Set<string>>): HistoryTotals {
  const players = new Set<string>();
  const t: HistoryTotals = { evenings: evenings.length, games: 0, players: 0, redWins: 0, blackWins: 0, draws: 0 };
  for (const e of evenings) {
    for (const id of playerIds.get(e.id) ?? []) players.add(id);
    for (const g of e.games) {
      t.games += 1;
      if (g.winner === "red") t.redWins += 1;
      else if (g.winner === "black") t.blackWins += 1;
      else t.draws += 1;
    }
  }
  t.players = players.size;
  return t;
}

/** Проведённые вечера с завершёнными партиями (новые сверху), сезоны и общая сводка. */
export async function getHistory(): Promise<{
  evenings: HistoryEvening[];
  seasons: SeasonSummary[];
  totals: HistoryTotals;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  const empty = { evenings: [], seasons: [], totals: summarize([], new Map()) };
  const db = getPublicClient();
  if (!db) return empty;

  const [eveningRows, seasonRows] = await Promise.all([
    db
      .from("evenings")
      .select("id, starts_at, place, season_id, games(id, game_no, format, status, winner, game_players(player_id))")
      .eq("status", "finished")
      .order("starts_at", { ascending: true }),
    db.from("seasons").select("id, name, starts_on, ends_on").order("starts_on", { ascending: false }),
  ]);

  const playerIds = new Map<string, Set<string>>();
  const evenings: HistoryEvening[] = check(eveningRows, "историю вечеров").map((e, i) => {
    const ids = new Set<string>();
    const games = (e.games as {
      id: string;
      game_no: number;
      format: HistoryGame["format"];
      status: string;
      winner: Winner | null;
      game_players: { player_id: string }[];
    }[])
      .filter((g) => g.status === "finished" && g.winner)
      .sort((a, b) => a.game_no - b.game_no)
      .map((g) => {
        for (const p of g.game_players) ids.add(p.player_id);
        return { id: g.id, no: g.game_no, format: g.format, winner: g.winner!, players: g.game_players.length };
      });
    playerIds.set(e.id, ids);
    return {
      id: e.id as string,
      number: i + 1,
      startsAt: e.starts_at as string,
      place: e.place as string,
      seasonId: (e.season_id as string | null) ?? null,
      participants: ids.size,
      games,
    };
  });
  evenings.reverse();

  const seasons: SeasonSummary[] = check(seasonRows, "сезоны").map((s) => ({
    id: s.id as string,
    name: s.name as string,
    startsOn: s.starts_on as string,
    endsOn: (s.ends_on as string | null) ?? null,
    ...summarize(evenings.filter((e) => e.seasonId === s.id), playerIds),
  }));

  return { evenings, seasons, totals: summarize(evenings, playerIds) };
}

export type GameProtocol = {
  id: string;
  no: number;
  format: keyof typeof FORMAT_LABEL;
  winner: Winner;
  finishedAt: string | null;
  eveningId: string;
  eveningStartsAt: string;
  hostName: string | null;
  seats: { seat: number; name: string; role: Role }[];
};

/** Протокол одной завершённой партии. null — партии нет или она ещё не завершена. */
export async function getGameProtocol(id: string): Promise<GameProtocol | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("club");

  const db = getPublicClient();
  if (!db) return null;

  const res = await db
    .from("games")
    .select(
      "id, game_no, format, status, winner, finished_at, evening_id, evenings(starts_at), " +
        "host:players!games_host_player_id_fkey(display_name), " +
        "game_players(seat, role, player:players(display_name))",
    )
    .eq("id", id)
    .maybeSingle();
  if (res.error) throw new Error(`Не удалось загрузить партию: ${res.error.message}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- строка из select без типов базы
  const g = res.data as any;
  if (!g || g.status !== "finished" || !g.winner) return null;

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);
  return {
    id: g.id,
    no: g.game_no,
    format: g.format,
    winner: g.winner,
    finishedAt: g.finished_at,
    eveningId: g.evening_id,
    eveningStartsAt: one<{ starts_at: string }>(g.evenings)?.starts_at ?? g.finished_at,
    hostName: one<{ display_name: string }>(g.host)?.display_name ?? null,
    seats: (g.game_players as { seat: number; role: Role; player: unknown }[])
      .map((p) => ({
        seat: p.seat,
        role: p.role,
        name: one(p.player as { display_name: string } | null)?.display_name ?? "—",
      }))
      .sort((a, b) => a.seat - b.seat),
  };
}
