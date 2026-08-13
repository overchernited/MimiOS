-- MimiOS marketplace: apps, widgets, and cartridges.
-- Applied identically locally (supabase start) and in the cloud (supabase db push).

-- =============================================================
-- Tables
-- =============================================================

create table if not exists apps (
  id          text primary key,
  title       text not null,
  description text not null default '',
  author      text not null default 'MimiOS',
  version     text not null default '1.0.0',
  img         text not null default '',
  manifest    jsonb not null default '{}'::jsonb,
  downloads   integer not null default 0,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists widgets (
  id          text primary key,
  title       text not null,
  description text not null default '',
  author      text not null default 'MimiOS',
  version     text not null default '1.0.0',
  img         text not null default '',
  manifest    jsonb not null default '{}'::jsonb,
  downloads   integer not null default 0,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists cartridges (
  id          text primary key,
  title       text not null,
  description text not null default '',
  author      text not null default 'MimiOS',
  version     text not null default '1.0.0',
  chip        text not null default 'auto',
  img         text not null default '',
  manifest    jsonb not null default '{}'::jsonb,
  file_path   text not null default '',
  file_size   integer not null default 0,
  downloads   integer not null default 0,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null unique,
  created_at timestamptz not null default now()
);

-- =============================================================
-- RLS Setup
-- =============================================================

alter table apps enable row level security;
alter table widgets enable row level security;
alter table cartridges enable row level security;
alter table profiles enable row level security;

grant select on apps, widgets, cartridges to anon;
grant select, insert, delete on apps, widgets, cartridges to authenticated;

grant select on profiles to anon, authenticated;
grant insert, update on profiles to authenticated;

-- CI pipeline publishes firmware with the service role
grant select, insert, update on cartridges to service_role;

-- Limpieza preventiva de políticas para evitar errores de duplicidad
drop policy if exists "apps public read" on apps;
drop policy if exists "widgets public read" on widgets;
drop policy if exists "cartridges public read" on cartridges;
drop policy if exists "profiles public read" on profiles;

drop policy if exists "apps auth insert" on apps;
drop policy if exists "widgets auth insert" on widgets;
drop policy if exists "cartridges auth insert" on cartridges;

drop policy if exists "profiles own insert" on profiles;
drop policy if exists "profiles own update" on profiles;

drop policy if exists "apps auth delete own" on apps;
drop policy if exists "widgets auth delete own" on widgets;
drop policy if exists "cartridges auth delete own" on cartridges;

-- Creación de políticas
create policy "apps public read" on apps for select using (true);
create policy "widgets public read" on widgets for select using (true);
create policy "cartridges public read" on cartridges for select using (true);
create policy "profiles public read" on profiles for select using (true);

create policy "apps auth insert" on apps for insert with check (auth.role() = 'authenticated');
create policy "widgets auth insert" on widgets for insert with check (auth.role() = 'authenticated');
create policy "cartridges auth insert" on cartridges for insert with check (auth.role() = 'authenticated');

create policy "profiles own insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on profiles for update using (auth.uid() = id);

create policy "apps auth delete own" on apps for delete using (auth.uid() = user_id);
create policy "widgets auth delete own" on widgets for delete using (auth.uid() = user_id);
create policy "cartridges auth delete own" on cartridges for delete using (auth.uid() = user_id);

-- =============================================================
-- Triggers and Functions
-- =============================================================

create or replace function public.set_user_id() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$;

drop trigger if exists apps_user_id on apps;
drop trigger if exists widgets_user_id on widgets;
drop trigger if exists cartridges_user_id on cartridges;

create trigger apps_user_id before insert on apps for each row execute function public.set_user_id();
create trigger widgets_user_id before insert on widgets for each row execute function public.set_user_id();
create trigger cartridges_user_id before insert on cartridges for each row execute function public.set_user_id();

create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base     text := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  username text := base;
  n        int := 0;
begin
  loop
    begin
      insert into public.profiles (id, username) values (new.id, username);
      return new;
    exception when unique_violation then
      n := n + 1;
      username := base || n::text;
    end;
  end loop;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.increment_downloads(target_kind text, target_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  case target_kind
    when 'apps' then update public.apps set downloads = downloads + 1 where id = target_id;
    when 'widgets' then update public.widgets set downloads = downloads + 1 where id = target_id;
    when 'cartridges' then update public.cartridges set downloads = downloads + 1 where id = target_id;
    else raise exception 'invalid kind: %', target_kind;
  end case;
end;
$$;

revoke all on function public.increment_downloads(text, text) from public;
grant execute on function public.increment_downloads(text, text) to anon, authenticated;

-- =============================================================
-- Storage: public bucket for the .bin files
-- =============================================================

insert into storage.buckets (id, name, public)
values ('cartridges', 'cartridges', true)
on conflict (id) do nothing;

drop policy if exists "cartridges public read" on storage.objects;
drop policy if exists "cartridges auth upload" on storage.objects;
drop policy if exists "cartridges auth update" on storage.objects;
drop policy if exists "cartridges auth delete" on storage.objects;

create policy "cartridges public read" on storage.objects for select using (bucket_id = 'cartridges');
create policy "cartridges auth upload" on storage.objects for insert with check (bucket_id = 'cartridges' and auth.role() = 'authenticated');
create policy "cartridges auth update" on storage.objects for update using (bucket_id = 'cartridges' and auth.role() = 'authenticated');
create policy "cartridges auth delete" on storage.objects for delete using (bucket_id = 'cartridges' and auth.role() = 'authenticated');

-- =============================================================
-- Initial seed
-- =============================================================

insert into apps (id, title, description, author, version, manifest, downloads) values
  ('shell', 'Shell', 'Terminal integrada de MimicroOS', 'MimiOS', '1.0.0',
   '{"application_tag":"shell-app","source_url":"/src/apps/shell/shell.svelte","image":"https://picsum.photos/seed/shell/200"}'::jsonb, 12),
  ('logger', 'Logger', 'Logs en tiempo real del dispositivo', 'MimiOS', '1.0.0',
   '{"application_tag":"logger-app","source_url":"/src/apps/logger/logger.svelte","image":"https://picsum.photos/seed/logger/200"}'::jsonb, 8),
  ('filemanager', 'File Manager', 'Gestor de archivos del dispositivo', 'MimiOS', '1.0.0',
   '{"application_tag":"filemanager-app","source_url":"/src/apps/filemanager/filemanager.svelte","image":"https://picsum.photos/seed/files/200"}'::jsonb, 3)
on conflict (id) do nothing;

insert into widgets (id, title, description, author, version, manifest, downloads) values
  ('notifications', 'Notifications', 'Centro de notificaciones', 'MimiOS', '1.0.0',
   '{"tag_name":"notifications-widget","source_url":"/src/widgets/notifications/bar/notifications-bar.svelte","col":2,"row":1,"span_col":6,"span_row":6}'::jsonb, 15),
  ('toast', 'Toast', 'Notificaciones flotantes', 'MimiOS', '1.0.0',
   '{"tag_name":"toast-widget","source_url":"/src/widgets/notifications/toast/toast-widget.svelte","col":12,"row":6,"span_col":5,"span_row":3}'::jsonb, 10),
  ('monitor', 'Monitor', 'Sensor data del master', 'MimiOS', '1.0.0',
   '{"tag_name":"monitor-widget","source_url":"/src/widgets/monitor/monitor.svelte","col":11,"row":1,"span_col":6,"span_row":1}'::jsonb, 20),
  ('devices', 'Devices', 'Lista de dispositivos secundarios', 'MimiOS', '1.0.0',
   '{"tag_name":"devices-widget","source_url":"/src/widgets/devices/devices.svelte","col":11,"row":2,"span_col":6,"span_row":2}'::jsonb, 6),
  ('taskbar', 'Taskbar', 'Barra de tareas y lanzador', 'MimiOS', '1.0.0',
   '{"tag_name":"taskbar-widget","source_url":"/src/widgets/taskbar/taskbar.svelte","col":6,"row":7,"span_col":6,"span_row":1}'::jsonb, 4)
on conflict (id) do nothing;