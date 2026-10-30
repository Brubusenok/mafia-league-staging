-- Mafia League: начальная схема базы данных.
--
-- Что здесь хранится:
--   players          — игроки клуба (вход в аккаунт необязателен)
--   admins           — кто администратор сайта
--   seasons          — сезоны
--   evenings         — игровые вечера
--   evening_signups  — запись игроков на вечер
--   games            — партии внутри вечера
--   game_players     — кто на каком месте сидел и с какой ролью
--
-- Права доступа (RLS) включены на всех таблицах:
--   * публично видно игроков, сезоны, вечера и партии;
--   * роли игроков видны только после окончания партии (пока партия идёт — это секрет);
--   * записать или изменить данные клуба может только администратор;
--   * игрок с аккаунтом управляет только своей записью на вечер.

-- ---------------------------------------------------------------- типы

create type public.player_status as enum ('newbie', 'club_member');
create type public.evening_status as enum ('planned', 'finished', 'cancelled');
create type public.signup_status as enum ('going', 'late', 'maybe', 'not_going');
create type public.game_format as enum ('classic10', 'short9');
create type public.game_status as enum ('in_progress', 'finished');
-- red — «красные» (мирные), black — «чёрные» (мафия).
create type public.game_winner as enum ('red', 'black', 'draw');
create type public.game_role as enum ('civilian', 'sheriff', 'don', 'mafia');

-- ------------------------------------------------------------- таблицы

create table public.players (
  id uuid primary key default gen_random_uuid(),
  -- Заполняется, когда игрок завёл аккаунт и администратор привязал его к профилю.
  user_id uuid unique references auth.users (id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  nickname text check (nickname is null or char_length(trim(nickname)) between 1 and 40),
  status public.player_status not null default 'newbie',
  avatar_url text,
  joined_on date,
  created_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_on date not null,
  ends_on date,
  check (ends_on is null or ends_on >= starts_on)
);

create table public.evenings (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons (id) on delete set null,
  starts_at timestamptz not null,
  place text not null default 'Грац',
  capacity smallint not null default 10 check (capacity between 9 and 10),
  status public.evening_status not null default 'planned',
  host_player_id uuid references public.players (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index evenings_starts_at_idx on public.evenings (starts_at desc);

create table public.evening_signups (
  evening_id uuid not null references public.evenings (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  status public.signup_status not null default 'going',
  created_at timestamptz not null default now(),
  primary key (evening_id, player_id)
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  evening_id uuid not null references public.evenings (id) on delete cascade,
  game_no smallint not null check (game_no > 0),
  format public.game_format not null,
  status public.game_status not null default 'in_progress',
  winner public.game_winner,
  -- Ведущий — отдельный человек, он не сидит за столом в этой партии.
  host_player_id uuid references public.players (id) on delete set null,
  started_at timestamptz,
  finished_at timestamptz,
  unique (evening_id, game_no),
  -- Победитель указан тогда и только тогда, когда партия завершена.
  check ((status = 'finished') = (winner is not null))
);

create table public.game_players (
  game_id uuid not null references public.games (id) on delete cascade,
  seat smallint not null check (seat between 1 and 10),
  player_id uuid not null references public.players (id) on delete restrict,
  role public.game_role not null,
  primary key (game_id, seat),
  unique (game_id, player_id)
);
create index game_players_player_idx on public.game_players (player_id);

-- ---------------------------------------------------- проверки игровой логики

-- В формате Short9 только 9 мест.
create function public.check_seat_for_format() returns trigger
language plpgsql set search_path = '' as $$
declare
  f public.game_format;
begin
  select format into f from public.games where id = new.game_id;
  if f = 'short9' and new.seat > 9 then
    raise exception 'В формате Short9 только 9 мест, получено место %', new.seat;
  end if;
  return new;
end $$;

create trigger game_players_check_seat
  before insert or update on public.game_players
  for each row execute function public.check_seat_for_format();

-- Нельзя завершить партию с неверным составом:
--   Классика 10: 10 игроков = 6 мирных + шериф + дон + 2 мафии;
--   Short9:       9 игроков = 5 мирных + шериф + дон + 2 мафии.
-- Ведущий не может одновременно сидеть за столом.
-- Чтобы внести старую партию, сначала создайте её как in_progress,
-- добавьте игроков, а потом переведите в finished.
create function public.validate_finished_game() returns trigger
language plpgsql set search_path = '' as $$
declare
  expected int := case new.format when 'classic10' then 10 else 9 end;
  total int;
  civ int;
  sher int;
  don int;
  maf int;
begin
  if new.status <> 'finished' or old.status = 'finished' then
    return new;
  end if;

  select count(*),
         count(*) filter (where role = 'civilian'),
         count(*) filter (where role = 'sheriff'),
         count(*) filter (where role = 'don'),
         count(*) filter (where role = 'mafia')
    into total, civ, sher, don, maf
    from public.game_players where game_id = new.id;

  if total <> expected then
    raise exception 'Партию нельзя завершить: нужно % игроков, а записано %', expected, total;
  end if;
  if sher <> 1 or don <> 1 or maf <> 2 or civ <> expected - 4 then
    raise exception 'Партию нельзя завершить: неверный набор ролей (мирные %, шериф %, дон %, мафия %)',
      civ, sher, don, maf;
  end if;
  if new.host_player_id is not null and exists (
    select 1 from public.game_players
    where game_id = new.id and player_id = new.host_player_id
  ) then
    raise exception 'Ведущий не может сидеть за столом в этой же партии';
  end if;

  if new.finished_at is null then
    new.finished_at := now();
  end if;
  return new;
end $$;

create trigger games_validate_finished
  before update on public.games
  for each row execute function public.validate_finished_game();

-- ------------------------------------------------------ права доступа (RLS)

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

create function public.owns_player(p uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.players where id = p and user_id = (select auth.uid())
  )
$$;

alter table public.players enable row level security;
alter table public.admins enable row level security;
alter table public.seasons enable row level security;
alter table public.evenings enable row level security;
alter table public.evening_signups enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;

-- Публичное чтение.
create policy players_read on public.players for select using (true);
create policy seasons_read on public.seasons for select using (true);
create policy evenings_read on public.evenings for select using (true);
create policy games_read on public.games for select using (true);

-- Записывать клубные данные может только администратор.
create policy players_admin_write on public.players for all
  using (public.is_admin()) with check (public.is_admin());
create policy seasons_admin_write on public.seasons for all
  using (public.is_admin()) with check (public.is_admin());
create policy evenings_admin_write on public.evenings for all
  using (public.is_admin()) with check (public.is_admin());
create policy games_admin_write on public.games for all
  using (public.is_admin()) with check (public.is_admin());

-- Роли и места видны всем только после окончания партии.
create policy game_players_read on public.game_players for select using (
  public.is_admin()
  or exists (
    select 1 from public.games g
    where g.id = game_id and g.status = 'finished'
  )
);
create policy game_players_admin_write on public.game_players for all
  using (public.is_admin()) with check (public.is_admin());

-- Запись на вечер: администратор — любую, игрок — только свою.
create policy signups_read on public.evening_signups for select
  using (public.is_admin() or public.owns_player(player_id));
create policy signups_insert on public.evening_signups for insert
  with check (
    public.is_admin()
    or (
      public.owns_player(player_id)
      and exists (
        select 1 from public.evenings e
        where e.id = evening_id and e.status = 'planned'
      )
    )
  );
create policy signups_update on public.evening_signups for update
  using (public.is_admin() or public.owns_player(player_id))
  with check (public.is_admin() or public.owns_player(player_id));
create policy signups_delete on public.evening_signups for delete
  using (public.is_admin() or public.owns_player(player_id));

-- Администраторы: каждый видит только себя. Назначаются вручную в SQL-редакторе.
create policy admins_read_self on public.admins for select
  using (user_id = (select auth.uid()));

-- Публичный список участников вечера — без статусов «опоздаю / возможно»,
-- потому что такие подробности приватные.
create view public.evening_participants as
  select evening_id, player_id
  from public.evening_signups
  where status in ('going', 'late');
