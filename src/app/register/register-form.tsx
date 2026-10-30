"use client";

import { useActionState } from "react";
import { signUp } from "@/app/login/actions";
import { keepFormSubmit } from "@/lib/keep-form";

const input =
  "h-12 w-full rounded-control border border-border bg-elevated px-4 text-text placeholder:text-muted focus:border-accent-text focus:outline-none";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, {});

  return (
    <form onSubmit={keepFormSubmit(action)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm text-muted">
          Как вас зовут
        </label>
        <input id="name" name="name" autoComplete="name" required maxLength={60} className={input} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
          Почта
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
          Пароль (не короче 8 символов)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          className={input}
        />
      </div>
      {state.message && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-control bg-accent font-medium transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Регистрируем…" : "Зарегистрироваться"}
      </button>
    </form>
  );
}
