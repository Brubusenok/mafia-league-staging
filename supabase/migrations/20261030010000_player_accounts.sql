-- Аккаунты игроков: профиль создаётся сам при регистрации,
-- администратор может привязать аккаунт к старому профилю с историей игр.

-- 1. При регистрации создаём профиль игрока со статусом «Новичок».
--    Имя берём из того, что ввёл человек, иначе из начала почты.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  nm text;
begin
  nm := left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 60);
  if nm = '' then
    nm := left(trim(split_part(coalesce(new.email, ''), '@', 1)), 60);
  end if;
  if nm = '' then
    nm := 'Игрок';
  end if;

  insert into public.players (user_id, display_name, status, joined_on)
  values (new.id, nm, 'newbie', current_date);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Привязка аккаунта к старому профилю (только для администратора).
--    historical — старый профиль без аккаунта (с историей игр),
--    account    — профиль, созданный при регистрации. Он удаляется,
--                 а его аккаунт переходит к старому профилю.
create function public.link_account(historical uuid, account uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  u uuid;
begin
  if not public.is_admin() then
    raise exception 'Нужны права администратора';
  end if;
  if historical = account then
    raise exception 'Выберите два разных профиля';
  end if;
  if not exists (select 1 from public.players where id = historical) then
    raise exception 'Игрок не найден';
  end if;
  if exists (select 1 from public.players where id = historical and user_id is not null) then
    raise exception 'К этому игроку уже привязан аккаунт';
  end if;

  select user_id into u from public.players where id = account;
  if u is null then
    raise exception 'У выбранного профиля нет аккаунта';
  end if;
  if exists (select 1 from public.game_players where player_id = account) then
    raise exception 'У профиля аккаунта уже есть сыгранные партии, объедините вручную';
  end if;

  -- Переносим записи на вечера.
  insert into public.evening_signups (evening_id, player_id, status)
  select evening_id, historical, status
  from public.evening_signups where player_id = account
  on conflict (evening_id, player_id) do nothing;

  delete from public.players where id = account;
  update public.players set user_id = u where id = historical;
end $$;

revoke execute on function public.link_account(uuid, uuid) from public, anon;
grant execute on function public.link_account(uuid, uuid) to authenticated;
