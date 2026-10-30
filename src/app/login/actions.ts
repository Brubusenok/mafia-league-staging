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

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
