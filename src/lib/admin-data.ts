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
