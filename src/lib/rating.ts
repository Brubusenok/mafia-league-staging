// Предварительный простой рейтинг. Формулу утвердим вместе с клубом.
// Сейчас: 1000 + 25 × (победы − поражения). Ничья не меняет рейтинг.

export type Winner = "red" | "black" | "draw";
export type Role = "civilian" | "sheriff" | "don" | "mafia";

export type FinishedGame = {
  winner: Winner;
  players: { player_id: string; role: Role }[];
};

export type PlayerStats = {
  playerId: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number | null; // доля побед 0..1, null если игр ещё нет
  rating: number;
};

const BASE_RATING = 1000;
const POINTS_PER_RESULT = 25;

/** Красные — мирные и шериф, чёрные — дон и мафия. */
export function sideOf(role: Role): "red" | "black" {
  return role === "civilian" || role === "sheriff" ? "red" : "black";
}

export function computeStats(
  playerIds: string[],
  games: FinishedGame[],
): Map<string, PlayerStats> {
  const stats = new Map<string, PlayerStats>();
  for (const id of playerIds) {
    stats.set(id, { playerId: id, games: 0, wins: 0, losses: 0, winRate: null, rating: BASE_RATING });
  }

  for (const game of games) {
    for (const p of game.players) {
      const s = stats.get(p.player_id);
      if (!s) continue;
      s.games += 1;
      if (game.winner === "draw") continue;
      if (sideOf(p.role) === game.winner) s.wins += 1;
      else s.losses += 1;
    }
  }

  for (const s of stats.values()) {
    s.winRate = s.games > 0 ? s.wins / s.games : null;
    s.rating = BASE_RATING + POINTS_PER_RESULT * (s.wins - s.losses);
  }
  return stats;
}

/** Итог партии для игрока: победа, поражение или ничья. */
export function resultFor(role: Role, winner: Winner): "win" | "loss" | "draw" {
  if (winner === "draw") return "draw";
  return sideOf(role) === winner ? "win" : "loss";
}

/** Рейтинг игрока после каждой партии (партии — от старых к новым), начиная с базового. */
export function ratingHistory(results: ("win" | "loss" | "draw")[]): number[] {
  const points = [BASE_RATING];
  for (const r of results) {
    const delta = r === "win" ? POINTS_PER_RESULT : r === "loss" ? -POINTS_PER_RESULT : 0;
    points.push(points[points.length - 1] + delta);
  }
  return points;
}
