"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { viennaLocalToIso } from "@/lib/format";
import { isUuid } from "@/lib/validate";

const EVENING_STATUSES = ["planned", "finished", "cancelled"] as const;
const SIGNUP_STATUSES = ["going", "late", "maybe", "not_going"] as const;
const oneOf = <T extends readonly string[]>(list: T, v: string): v is T[number] => list.includes(v);

export async function saveEvening(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const startsLocal = String(formData.get("starts_at") ?? "");
  const place = String(formData.get("place") ?? "").trim();
  const capacity = Number(formData.get("capacity"));
  const status = String(formData.get("status") ?? "");
  const host = String(formData.get("host_player_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const startsAt = viennaLocalToIso(startsLocal);
  if (!startsAt) return { message: "Укажите дату и время (по времени Граца)." };
  if (place.length < 1 || place.length > 100) return { message: "Место: от 1 до 100 символов." };
  if (capacity !== 9 && capacity !== 10) return { message: "Мест может быть 9 или 10." };
  if (!oneOf(EVENING_STATUSES, status)) return { message: "Выберите статус вечера." };
  if (host && !isUuid(host)) return { message: "Неверный ведущий." };
  if (note.length > 500) return { message: "Заметка: не больше 500 символов." };
  if (id && !isUuid(id)) return { message: "Неверный вечер." };

  const row = {
    starts_at: startsAt,
    place,
    capacity,
    status,
    host_player_id: host || null,
    note: note || null,
  };

  if (id) {
    const { error } = await supabase.from("evenings").update(row).eq("id", id);
    if (error) return { message: "Не удалось сохранить. Попробуйте ещё раз." };
    updateTag("club");
    return { ok: true, message: "Сохранено." };
  }

  const { data, error } = await supabase.from("evenings").insert(row).select("id").single();
  if (error || !data) return { message: "Не удалось создать вечер. Попробуйте ещё раз." };
  updateTag("club");
  redirect(`/admin/evenings/${data.id}`);
}

export async function deleteEvening(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) return { message: "Неверный вечер." };

  // Партии удаляются вместе с вечером, поэтому такой вечер удалять нельзя.
  const { count, error: countError } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("evening_id", id);
  if (countError) return { message: "Не удалось проверить партии. Попробуйте ещё раз." };
  if ((count ?? 0) > 0) {
    return { message: "Нельзя удалить: на вечере есть сыгранные партии. Отметьте вечер как «Отменён»." };
  }

  const { error } = await supabase.from("evenings").delete().eq("id", id);
  if (error) return { message: "Не удалось удалить. Попробуйте ещё раз." };

  updateTag("club");
  redirect("/admin/evenings");
}

export async function setSignup(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const eveningId = String(formData.get("evening_id") ?? "");
  const playerId = String(formData.get("player_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isUuid(eveningId) || !isUuid(playerId)) return { message: "Выберите игрока." };
  if (!oneOf(SIGNUP_STATUSES, status)) return { message: "Выберите статус." };

  const { error } = await supabase
    .from("evening_signups")
    .upsert({ evening_id: eveningId, player_id: playerId, status }, { onConflict: "evening_id,player_id" });
  if (error) return { message: "Не удалось сохранить запись." };

  updateTag("club");
  return { ok: true, message: "Сохранено." };
}

export async function removeSignup(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const eveningId = String(formData.get("evening_id") ?? "");
  const playerId = String(formData.get("player_id") ?? "");
  if (!isUuid(eveningId) || !isUuid(playerId)) return { message: "Неверная запись." };

  const { error } = await supabase
    .from("evening_signups")
    .delete()
    .eq("evening_id", eveningId)
    .eq("player_id", playerId);
  if (error) return { message: "Не удалось удалить запись." };

  updateTag("club");
  return { ok: true, message: "Запись удалена." };
}
