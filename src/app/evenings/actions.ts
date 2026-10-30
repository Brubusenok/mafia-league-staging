"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { createServerSupabase } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validate";

const STATUSES = ["going", "late", "maybe", "not_going"] as const;
const MESSAGE = {
  going: "Вы записаны: придёте вовремя.",
  late: "Вы записаны: опоздаете.",
  maybe: "Отмечено: возможно, придёте.",
  not_going: "Отмечено: не придёте.",
} as const;

/** Игрок сам записывается на вечер, меняет статус или отменяет запись. */
export async function rsvp(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const eveningId = String(formData.get("evening_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isUuid(eveningId)) return { message: "Неверный вечер." };
  const cancel = status === "cancel";
  if (!cancel && !(STATUSES as readonly string[]).includes(status)) return { message: "Выберите вариант." };

  // Записываем только того игрока, который привязан к этому аккаунту.
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!player) return { message: "Не найден профиль игрока. Напишите организатору." };

  const { error } = cancel
    ? await supabase
        .from("evening_signups")
        .delete()
        .eq("evening_id", eveningId)
        .eq("player_id", player.id)
    : await supabase
        .from("evening_signups")
        .upsert(
          { evening_id: eveningId, player_id: player.id, status: status as (typeof STATUSES)[number] },
          { onConflict: "evening_id,player_id" },
        );

  if (error) return { message: "Не удалось сохранить. Возможно, вечер уже прошёл или отменён." };

  updateTag("club");
  return { ok: true, message: cancel ? "Запись отменена." : MESSAGE[status as (typeof STATUSES)[number]] };
}
