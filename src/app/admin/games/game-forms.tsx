"use client";

import { useActionState } from "react";
import { createGame, deleteGame, reopenGame, saveGame } from "@/app/admin/games/actions";
import type { AdminGame } from "@/lib/admin-data";
import { FORMAT_LABEL, ROLE_LABEL, WINNER_LABEL } from "@/lib/format";

const field =
  "h-11 w-full rounded-control border border-border bg-elevated px-3 text-text focus:border-accent-text focus:outline-none";
const button =
  "h-11 rounded-control bg-accent px-5 text-sm font-medium transition-colors hover:bg-accent-hover disabled:opacity-60";

type PlayerOption = { id: string; name: string };

function Message({ state }: { state: { ok?: boolean; message?: string } }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`mt-3 text-sm ${state.ok ? "text-success" : "text-error"}`}
    >
      {state.message}
    </p>
  );
}

export function AddGameForm({ eveningId }: { eveningId: string }) {
  const [state, action, pending] = useActionState(createGame, {});
  return (
    <form action={action}>
      <input type="hidden" name="evening_id" value={eveningId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm text-muted">
          Формат новой партии
          <select name="format" defaultValue="classic10" className={`mt-1 ${field} w-56`}>
            <option value="classic10">{FORMAT_LABEL.classic10} (10 игроков)</option>
            <option value="short9">{FORMAT_LABEL.short9} (9 игроков)</option>
          </select>
        </label>
        <button type="submit" disabled={pending} className={button}>
          {pending ? "…" : "Добавить партию"}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function GameEditor({
  game,
  players,
  signedIds,
}: {
  game: AdminGame;
  players: PlayerOption[];
  signedIds: string[];
}) {
  const [state, action, pending] = useActionState(saveGame, {});
  const total = game.format === "classic10" ? 10 : 9;
  const bySeat = new Map(game.seats.map((s) => [s.seat, s]));
  const signed = new Set(signedIds);
  const signedPlayers = players.filter((p) => signed.has(p.id));
  const others = players.filter((p) => !signed.has(p.id));

  const playerOptions = (
    <>
      <option value="">— свободно —</option>
      {signedPlayers.length > 0 && (
        <optgroup label="Записались на вечер">
          {signedPlayers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </optgroup>
      )}
      <optgroup label={signedPlayers.length > 0 ? "Остальные игроки" : "Игроки"}>
        {others.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </optgroup>
    </>
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="game_id" value={game.id} />

      <label className="block text-sm text-muted">
        Ведущий (не играет за столом)
        <select name="host_player_id" defaultValue={game.host_player_id ?? ""} className={`mt-1 ${field} sm:max-w-sm`}>
          <option value="">Не назначен</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <h3 className="mb-2 font-medium">Места за столом</h3>
        <p className="mb-3 text-sm text-muted">
          {game.format === "classic10"
            ? "Классика 10: 6 мирных, шериф, дон и 2 мафии."
            : "Short9: 5 мирных, шериф, дон и 2 мафии."}{" "}
          Для черновика можно заполнить не все места.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: total }, (_, i) => i + 1).map((seat) => {
            const cur = bySeat.get(seat);
            return (
              <li key={seat} className="grid grid-cols-[2.5rem_1fr_8rem] items-center gap-2">
                <span className="text-center font-display text-lg text-accent-text">{seat}</span>
                <select
                  name={`seat_${seat}_player`}
                  defaultValue={cur?.player_id ?? ""}
                  aria-label={`Место ${seat}: игрок`}
                  className={field}
                >
                  {playerOptions}
                </select>
                <select
                  name={`seat_${seat}_role`}
                  defaultValue={cur?.role ?? "civilian"}
                  aria-label={`Место ${seat}: роль`}
                  className={field}
                >
                  {Object.entries(ROLE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      </div>

      <label className="block text-sm text-muted">
        Победитель (нужен, чтобы завершить партию)
        <select name="winner" defaultValue={game.winner ?? ""} className={`mt-1 ${field} sm:max-w-sm`}>
          <option value="">Пока не выбран</option>
          {Object.entries(WINNER_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="intent"
          value="save"
          disabled={pending}
          className="h-11 rounded-control border border-border px-5 text-sm font-medium hover:border-accent-text disabled:opacity-60"
        >
          Сохранить черновик
        </button>
        <button type="submit" name="intent" value="finish" disabled={pending} className={button}>
          Завершить партию
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function ReopenGameButton({ gameId }: { gameId: string }) {
  const [state, action, pending] = useActionState(reopenGame, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Вернуть партию в черновик? Она пропадёт из рейтинга, пока вы её снова не завершите.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="game_id" value={gameId} />
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-control border border-border px-5 text-sm hover:border-accent-text disabled:opacity-60"
      >
        Исправить: вернуть в черновик
      </button>
      <Message state={state} />
    </form>
  );
}

export function DeleteGameButton({ gameId }: { gameId: string }) {
  const [state, action, pending] = useActionState(deleteGame, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Удалить этот черновик партии?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="game_id" value={gameId} />
      <button type="submit" disabled={pending} className="min-h-11 text-sm text-error hover:underline disabled:opacity-60">
        Удалить партию
      </button>
      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
