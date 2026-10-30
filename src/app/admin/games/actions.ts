"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { isUuid } from "@/lib/validate";

const ROLES = ["civilian", "sheriff", "don", "mafia"] as const;
const WINNERS = ["red", "black", "draw"] as const;
const FORMATS = ["classic10", "short9"] as const;
const oneOf = <T extends readonly string[]>(list: T, v: string): v is T[number] => list.includes(v);

/** Создаёт пустую партию (черновик) на вечере и открывает её для заполнения. */
export async function createGame(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const eveningId = String(formData.get("evening_id") ?? "");
  const format = String(formData.get("format") ?? "");
  if (!isUuid(eveningId)) return { message: "Неверный вечер." };
  if (!oneOf(FORMATS, format)) return { message: "Выберите формат." };

  const [{ data: evening }, { data: last }] = await Promise.all([
    supabase.from("evenings").select("host_player_id").eq("id", eveningId).maybeSingle(),
    supabase
      .from("games")
      .select("game_no")
      .eq("evening_id", eveningId)
      .order("game_no", { ascending: false })
      .limit(1),
  ]);
  if (!evening) return { message: "Вечер не найден." };

  const { data, error } = await supabase
    .from("games")
    .insert({
      evening_id: eveningId,
      game_no: (last?.[0]?.game_no ?? 0) + 1,
      format,
      host_player_id: evening.host_player_id,
    })
    .select("id")
    .single();
  if (error || !data) return { message: "Не удалось создать партию. Попробуйте ещё раз." };

  redirect(`/admin/games/${data.id}`);
}

/** Сохраняет рассадку и роли; при intent=finish ещё и завершает партию. */
export async function saveGame(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const gameId = String(formData.get("game_id") ?? "");
  const intent = String(formData.get("intent") ?? "save");
  const host = String(formData.get("host_player_id") ?? "");
  const winner = String(formData.get("winner") ?? "");
  if (!isUuid(gameId)) return { message: "Неверная партия." };
  if (host && !isUuid(host)) return { message: "Неверный ведущий." };
  if (winner && !oneOf(WINNERS, winner)) return { message: "Неверный победитель." };
  const finish = intent === "finish";

  const { data: game } = await supabase.from("games").select("format").eq("id", gameId).maybeSingle();
  if (!game) return { message: "Партия не найдена." };
  const total = game.format === "classic10" ? 10 : 9;

  const seats: { seat: number; player: string; role: string }[] = [];
  const used = new Set<string>();
  for (let seat = 1; seat <= total; seat++) {
    const player = String(formData.get(`seat_${seat}_player`) ?? "");
    const role = String(formData.get(`seat_${seat}_role`) ?? "");
    if (!player) continue;
    if (!isUuid(player)) return { message: `Место ${seat}: неверный игрок.` };
    if (!oneOf(ROLES, role)) return { message: `Место ${seat}: выберите роль.` };
    if (used.has(player)) return { message: "Один игрок не может сидеть на двух местах." };
    used.add(player);
    seats.push({ seat, player, role });
  }

  const { error } = await supabase.rpc("save_game", {
    p_game: gameId,
    p_host: host || null,
    p_seats: seats,
    p_winner: winner || null,
    p_finish: finish,
  });
  if (error) {
    // P0001 — понятные сообщения из базы (состав, ведущий, победитель).
    return { message: error.code === "P0001" ? error.message : "Не удалось сохранить. Попробуйте ещё раз." };
  }

  updateTag("club");
  return {
    ok: true,
    message: finish ? "Партия завершена и учтена в рейтинге." : "Черновик сохранён.",
  };
}

/** Возвращает завершённую партию в черновик, чтобы исправить ошибку. */
export async function reopenGame(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const gameId = String(formData.get("game_id") ?? "");
  if (!isUuid(gameId)) return { message: "Неверная партия." };

  const { error } = await supabase
    .from("games")
    .update({ status: "in_progress", winner: null, finished_at: null })
    .eq("id", gameId);
  if (error) return { message: "Не удалось вернуть в черновик." };

  updateTag("club");
  return { ok: true, message: "Партия снова в черновике." };
}

/** Удаляет только черновик: завершённую партию сначала нужно вернуть в черновик. */
export async function deleteGame(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const gameId = String(formData.get("game_id") ?? "");
  if (!isUuid(gameId)) return { message: "Неверная партия." };

  const { data: game } = await supabase
    .from("games")
    .select("status, evening_id")
    .eq("id", gameId)
    .maybeSingle();
  if (!game) return { message: "Партия не найдена." };
  if (game.status === "finished") {
    return { message: "Завершённую партию нельзя удалить. Сначала верните её в черновик." };
  }

  const { error } = await supabase.from("games").delete().eq("id", gameId);
  if (error) return { message: "Не удалось удалить партию." };

  updateTag("club");
  redirect(`/admin/evenings/${game.evening_id}`);
}
