import type { SupabaseClient } from "@supabase/supabase-js";

// Данные для админки. БЕЗ кэша: здесь есть то, что не должен видеть посторонний
// (роли в идущих партиях, записи на вечер). Клиент приходит от вошедшего администратора.

export type AdminPlayer = {
  id: string;
  display_name: string;
  nickname: string | null;
  status: "club_member" | "newbie";
  user_id: string | null;
};

export async function adminPlayers(db: SupabaseClient): Promise<AdminPlayer[]> {
  const { data, error } = await db
    .from("players")
    .select("id, display_name, nickname, status, user_id")
    .order("display_name");
  if (error) throw new Error(`Не удалось загрузить игроков: ${error.message}`);
  return data;
}

export async function adminCounts(db: SupabaseClient) {
  const count = async (table: string, filter?: [string, string]) => {
    let q = db.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n, error } = await q;
    if (error) throw new Error(`Не удалось посчитать ${table}: ${error.message}`);
    return n ?? 0;
  };
  const [players, evenings, games, playing] = await Promise.all([
    count("players"),
    count("evenings"),
    count("games"),
    count("games", ["status", "in_progress"]),
  ]);
  return { players, evenings, games, playing };
}

export type AdminEvening = {
  id: string;
  starts_at: string;
  place: string;
  capacity: number;
  status: "planned" | "finished" | "cancelled";
  host_player_id: string | null;
  note: string | null;
};

export async function adminEvenings(db: SupabaseClient) {
  const { data, error } = await db
    .from("evenings")
    .select("id, starts_at, place, capacity, status, host_player_id, note, evening_signups(count)")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(`Не удалось загрузить вечера: ${error.message}`);
  return data.map((e) => ({
    ...(e as unknown as AdminEvening),
    signups: (e.evening_signups as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export async function adminEvening(db: SupabaseClient, id: string): Promise<AdminEvening | null> {
  const { data, error } = await db
    .from("evenings")
    .select("id, starts_at, place, capacity, status, host_player_id, note")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Не удалось загрузить вечер: ${error.message}`);
  return data as AdminEvening | null;
}

export type AdminSignup = {
  player_id: string;
  name: string;
  status: "going" | "late" | "maybe" | "not_going";
};

export async function adminSignups(db: SupabaseClient, eveningId: string): Promise<AdminSignup[]> {
  const { data, error } = await db
    .from("evening_signups")
    .select("player_id, status, players(display_name)")
    .eq("evening_id", eveningId);
  if (error) throw new Error(`Не удалось загрузить записи: ${error.message}`);
  return data
    .map((s) => {
      const p = Array.isArray(s.players) ? s.players[0] : s.players;
      return { player_id: s.player_id, status: s.status, name: p?.display_name ?? "—" } as AdminSignup;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}
