-- ТОЛЬКО ДЛЯ ПРОБНОГО ПРОЕКТА. Стирает всё в схеме public и создаёт её заново.
-- Защита: если в базе уже есть игроки, скрипт останавливается и ничего не меняет.
-- Пользователи (Authentication) не затрагиваются.

do $$
begin
  if to_regclass('public.players') is not null then
    if exists (select 1 from public.players) then
      raise exception 'В этой базе есть игроки. Это не пустой пробный проект, сброс остановлен.';
    end if;
  end if;
end $$;

drop schema public cascade;
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
