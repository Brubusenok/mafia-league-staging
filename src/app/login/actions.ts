"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { createServerSupabase } from "@/lib/supabase/server";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { message: "Введите почту и пароль." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Одно и то же сообщение для любой ошибки, чтобы не раскрывать, какие почты есть в системе.
  if (error) return { message: "Неверная почта или пароль." };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  redirect(isAdmin === true ? "/admin" : "/evenings");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 1 || name.length > 60) return { message: "Имя: от 1 до 60 символов." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "Проверьте адрес почты." };
  if (password.length < 8) return { message: "Пароль: не короче 8 символов." };
  if (password.length > 72) return { message: "Пароль: не длиннее 72 символов." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name } },
  });

  if (error) {
    if (/already registered/i.test(error.message)) {
      return { message: "Эта почта уже зарегистрирована. Попробуйте войти." };
    }
    if (/password/i.test(error.message)) {
      return { message: "Пароль слишком простой. Придумайте посложнее." };
    }
    return { message: "Не удалось зарегистрироваться. Попробуйте ещё раз." };
  }

  // Если в Supabase всё ещё включено подтверждение почты, сессии не будет.
  if (!data.session) {
    return { message: "Мы отправили письмо для подтверждения почты. Перейдите по ссылке в нём и войдите." };
  }

  redirect("/evenings");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
