-- Сохранение партии одной операцией: рассадка, ведущий и (по желанию) завершение.
-- Всё выполняется целиком или не выполняется совсем: при ошибке (например, неверный
-- состав ролей) ничего не меняется. Права проверяет RLS (писать может только админ).

create function public.save_game(
  p_game uuid,
  p_host uuid,
  p_seats jsonb,
  p_winner public.game_winner,
  p_finish boolean
) returns void
language plpgsql set search_path = '' as $$
declare
  g public.games;
begin
  if not public.is_admin() then
    raise exception 'Нужны права администратора';
  end if;

  select * into g from public.games where id = p_game for update;
  if not found then
    raise exception 'Партия не найдена';
  end if;
  if g.status = 'finished' then
    raise exception 'Партия завершена. Сначала верните её в черновик';
  end if;
  if jsonb_typeof(p_seats) <> 'array' then
    raise exception 'Неверный формат рассадки';
  end if;
  if p_finish and p_winner is null then
    raise exception 'Выберите победителя';
  end if;

  delete from public.game_players where game_id = p_game;

  insert into public.game_players (game_id, seat, player_id, role)
  select p_game,
         (e ->> 'seat')::smallint,
         (e ->> 'player')::uuid,
         (e ->> 'role')::public.game_role
  from jsonb_array_elements(p_seats) as e;

  update public.games
     set host_player_id = p_host,
         started_at = coalesce(started_at, now())
   where id = p_game;

  if p_finish then
    -- Триггер проверяет состав и роли, ведущего не за столом.
    update public.games set status = 'finished', winner = p_winner where id = p_game;
  end if;
end $$;

revoke execute on function public.save_game(uuid, uuid, jsonb, public.game_winner, boolean) from public, anon;
grant execute on function public.save_game(uuid, uuid, jsonb, public.game_winner, boolean) to authenticated;
