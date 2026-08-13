-- MimicroOS marketplace: apps, widgets, cartridges and firmware.
-- Applied identically locally (supabase start) and in the cloud (supabase db push).

-- =============================================================
-- Tables
-- =============================================================

-- apps and widgets store their specific config (tag, source_url,
-- grid, size...) in `manifest` as JSON, with no fixed columns.
-- user_id = row owner (assigned by a trigger on insert).

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

-- firmware: dedicated table for the base firmware. The hub loads it from
-- here (special `firmware/` folder in storage), separate from the catalog.
-- No user_id/file_path: the firmware is uploaded to the database manually.

create table if not exists firmware (
  id          text primary key,
  title       text not null,
  description text not null default '',
  author      text not null default 'MimiOS',
  version     text not null default '1.0.0',
  chip        text not null default 'auto',
  file_size   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- profiles: public handle for each auth user. Created automatically on
-- signup (username from user metadata or email prefix, de-duplicated).

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null unique,
  created_at timestamptz not null default now()
);

-- =============================================================
-- RLS: the hub only reads. Insert requires an authenticated session
-- (developers). Delete: each dev can delete ONLY what they uploaded
-- (user_id = auth.uid()). Update: nobody. The download counter
-- goes through the increment_downloads RPC.
-- =============================================================

alter table apps enable row level security;
alter table widgets enable row level security;
alter table cartridges enable row level security;
alter table firmware enable row level security;
alter table profiles enable row level security;

grant select on apps, widgets, cartridges, firmware to anon;
grant select, insert, delete on apps, widgets, cartridges to authenticated;
grant select on firmware to authenticated;

grant select on profiles to anon, authenticated;
grant insert, update on profiles to authenticated;

-- CI pipeline (build-firmware.yml) publishes the base firmware with the
-- service role: it upserts the row after uploading the .bin to storage.
grant select, insert, update on firmware to service_role;

create policy "apps public read" on apps for select using (true);
create policy "widgets public read" on widgets for select using (true);
create policy "cartridges public read" on cartridges for select using (true);
create policy "firmware public read" on firmware for select using (true);
create policy "profiles public read" on profiles for select using (true);

create policy "apps auth insert" on apps for insert with check (auth.role() = 'authenticated');
create policy "widgets auth insert" on widgets for insert with check (auth.role() = 'authenticated');
create policy "cartridges auth insert" on cartridges for insert with check (auth.role() = 'authenticated');

create policy "profiles own insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on profiles for update using (auth.uid() = id);

create policy "apps auth delete own" on apps for delete using (auth.uid() = user_id);
create policy "widgets auth delete own" on widgets for delete using (auth.uid() = user_id);
create policy "cartridges auth delete own" on cartridges for delete using (auth.uid() = user_id);

-- Assigns the owner (auth.uid()) on every insert, ignoring whatever
-- the client sends, so nobody can impersonate another user.

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

create trigger apps_user_id before insert on apps for each row execute function public.set_user_id();
create trigger widgets_user_id before insert on widgets for each row execute function public.set_user_id();
create trigger cartridges_user_id before insert on cartridges for each row execute function public.set_user_id();

-- Creates a public profile right after signup. Username comes from user
-- metadata, falling back to the email prefix; conflicts get a numeric suffix.

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

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Download counter: the only allowed UPDATE, via a security definer RPC
-- (avoids granting write access to the tables).

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
-- Storage: public bucket for the .bin files. The hub downloads
-- without auth; the dev (authenticated) uploads/deletes cartridges
-- from their tooling. The base firmware is uploaded manually.
-- =============================================================

insert into storage.buckets (id, name, public)
values ('cartridges', 'cartridges', true)
on conflict (id) do nothing;

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

insert into firmware (id, title, description, author, version, chip, file_size) values
  ('mimios-base-esp32',  'MimiOS Base ESP32',  'Firmware base para ESP32 clasico',     'MimiOS', '1.0.0', 'esp32',  0),
  ('mimios-base-esp32s3','MimiOS Base ESP32-S3','Firmware base para ESP32-S3',          'MimiOS', '1.0.0', 'esp32s3',0),
  ('mimios-base-esp32c3','MimiOS Base ESP32-C3','Firmware base para ESP32-C3',          'MimiOS', '1.0.0', 'esp32c3',0),
  ('mimios-base-esp32s2','MimiOS Base ESP32-S2','Firmware base para ESP32-S2',          'MimiOS', '1.0.0', 'esp32s2',0)
on conflict (id) do nothing;
