import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Проверка «это администратор» на сервере. Вызывайте в начале КАЖДОЙ админской
 * страницы и КАЖДОГО серверного действия: действия — это открытые адреса,
 * их может вызвать кто угодно.
 *
 * Не вошёл — отправляем на /login. Вошёл, но не администратор — тоже на /login.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabase();

  // getUser() сверяет сессию с сервером Supabase, поэтому подделать cookie нельзя.
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/login?error=forbidden");

  return { supabase, user: data.user };
}
