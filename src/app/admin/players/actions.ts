"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "@/lib/form-state";
import { isUuid } from "@/lib/validate";

const STATUSES = ["club_member", "newbie"] as const;

export async function savePlayer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (name.length < 1 || name.length > 60) return { message: "Имя: от 1 до 60 символов." };
  if (nickname.length > 40) return { message: "Никнейм: не больше 40 символов." };
  if (!(STATUSES as readonly string[]).includes(status)) return { message: "Выберите статус." };

  const row = {
    display_name: name,
    nickname: nickname || null,
    status: status as (typeof STATUSES)[number],
  };
  const { error } = id
    ? await supabase.from("players").update(row).eq("id", id)
    : await supabase.from("players").insert({ ...row, joined_on: new Date().toISOString().slice(0, 10) });

  if (error) return { message: "Не удалось сохранить. Попробуйте ещё раз." };

  updateTag("club");
  return { ok: true, message: id ? "Сохранено." : "Игрок добавлен." };
}

export async function deletePlayer(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { message: "Не указан игрок." };

  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) {
    // 23503 — на игрока ссылаются сыгранные партии.
    return {
      message:
        error.code === "23503"
          ? "Нельзя удалить: у игрока есть сыгранные партии."
          : "Не удалось удалить. Попробуйте ещё раз.",
    };
  }

  updateTag("club");
  return { ok: true, message: "Игрок удалён." };
}

/** Привязывает аккаунт (профиль, созданный при регистрации) к старому профилю с историей игр. */
export async function linkAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const historical = String(formData.get("historical") ?? "");
  const account = String(formData.get("account") ?? "");
  if (!isUuid(historical) || !isUuid(account)) return { message: "Выберите профиль." };

  const { error } = await supabase.rpc("link_account", { historical, account });
  if (error) {
    // P0001 — наши понятные сообщения из базы; остальное не показываем.
    return { message: error.code === "P0001" ? error.message : "Не удалось привязать. Попробуйте ещё раз." };
  }

  updateTag("club");
  return { ok: true, message: "Аккаунт привязан. Обновите страницу." };
}
