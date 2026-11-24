-- LONG-KLONG · Supabase schema
-- วิธีใช้: Supabase Dashboard → SQL Editor → New query → วางทั้งไฟล์นี้ → Run (รันซ้ำได้ ไม่พัง)

create extension if not exists pgcrypto;

-- ห้องลอย ------------------------------------------------------------
create table if not exists public.rooms (
  code        text primary key check (code ~ '^[A-Z0-9-]{4,20}$'),
  name        text not null default 'ห้องของเรา' check (char_length(name) between 1 and 40),
  kind        text not null default 'couple' check (kind in ('couple', 'group', 'public')),
  created_at  timestamptz not null default now()
);

-- คนที่เข้าห้อง (ใช้หา "ยังไม่ลอย") ----------------------------------------
create table if not exists public.members (
  room_code   text not null references public.rooms(code) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  status      text not null default 'joined' check (status in ('joined', 'floated')),
  updated_at  timestamptz not null default now(),
  primary key (room_code, name)
);

-- กระทง --------------------------------------------------------------
create table if not exists public.krathongs (
  id          uuid primary key default gen_random_uuid(),
  room_code   text not null references public.rooms(code) on delete cascade,
  author      text not null check (char_length(author) between 1 and 40),
  base        text not null check (base in ('leaf', 'bread', 'coco', 'lotus')),
  flower      text not null check (flower in ('rose', 'marigold', 'orchid', 'jasmine')),
  wish        text check (char_length(wish) <= 200),
  tied_to     uuid references public.krathongs(id) on delete set null,
  tags        text[] not null default '{}' check (cardinality(tags) <= 20),
  for_name    text check (char_length(for_name) <= 40),
  lane        real not null default 0.5 check (lane between 0 and 1),
  created_at  timestamptz not null default now()
);
create index if not exists krathongs_room_idx on public.krathongs (room_code, created_at);

-- รีแอ็กชัน (แสงเทียน / หัวใจ) -----------------------------------------
create table if not exists public.reactions (
  id          bigint generated always as identity primary key,
  room_code   text not null references public.rooms(code) on delete cascade,
  krathong_id uuid not null references public.krathongs(id) on delete cascade,
  kind        text not null check (kind in ('fire', 'heart')),
  created_at  timestamptz not null default now()
);
create index if not exists reactions_room_idx on public.reactions (room_code);

-- แม่น้ำสาธารณะ ---------------------------------------------------------
insert into public.rooms (code, name, kind)
values ('PUBLIC', 'แม่น้ำสาธารณะ', 'public')
on conflict (code) do nothing;

-- Row Level Security: ใครก็อ่าน/เพิ่มได้ (ไม่มีระบบ login ในเวอร์ชันแรก)
-- แต่แก้ไข/ลบกระทงของคนอื่นไม่ได้
alter table public.rooms     enable row level security;
alter table public.members   enable row level security;
alter table public.krathongs enable row level security;
alter table public.reactions enable row level security;

drop policy if exists rooms_read on public.rooms;
drop policy if exists rooms_insert on public.rooms;
create policy rooms_read   on public.rooms for select to anon, authenticated using (true);
create policy rooms_insert on public.rooms for insert to anon, authenticated with check (kind in ('couple', 'group'));

drop policy if exists members_read on public.members;
drop policy if exists members_insert on public.members;
drop policy if exists members_update on public.members;
create policy members_read   on public.members for select to anon, authenticated using (true);
create policy members_insert on public.members for insert to anon, authenticated with check (true);
create policy members_update on public.members for update to anon, authenticated using (true) with check (true);

drop policy if exists krathongs_read on public.krathongs;
drop policy if exists krathongs_insert on public.krathongs;
create policy krathongs_read   on public.krathongs for select to anon, authenticated using (true);
create policy krathongs_insert on public.krathongs for insert to anon, authenticated with check (true);

drop policy if exists reactions_read on public.reactions;
drop policy if exists reactions_insert on public.reactions;
create policy reactions_read   on public.reactions for select to anon, authenticated using (true);
create policy reactions_insert on public.reactions for insert to anon, authenticated with check (true);

-- เปิด Realtime ให้ 3 ตาราง (กระทงใหม่โผล่ในจอทุกคนทันที)
do $$
declare t text;
begin
  foreach t in array array['krathongs', 'reactions', 'members'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- v2: คะแนนเกมซุ้มงานวัด ------------------------------------------------
create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  room_code   text not null references public.rooms(code) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  game        text not null check (game in ('balloon', 'ring')),
  score       int  not null check (score between 0 and 200),
  created_at  timestamptz not null default now()
);
create index if not exists scores_board_idx on public.scores (room_code, game, score desc);
grant select, insert on public.scores to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter table public.scores enable row level security;
drop policy if exists scores_read on public.scores;
drop policy if exists scores_insert on public.scores;
create policy scores_read   on public.scores for select to anon, authenticated using (true);
create policy scores_insert on public.scores for insert to anon, authenticated with check (true);

-- v3: ของที่ลอยไปกับกระทง ------------------------------------------------
alter table public.krathongs add column if not exists charms text[] not null default '{}';
alter table public.krathongs drop constraint if exists krathongs_charms_check;
alter table public.krathongs add constraint krathongs_charms_check check (
  cardinality(charms) <= 3 and charms <@ array['pdf','zip','boss','dog','cat','mail','bill','bug','ex','ot','lazy','monday']::text[]
);

-- v4: เปลี่ยนชื่อ (ยืนยันตัวตนด้วย device_id ที่เก็บในเครื่อง) ------------------------
alter table public.krathongs add column if not exists device_id uuid;
alter table public.members   add column if not exists device_id uuid;
create or replace function public.rename_me(p_room text, p_device uuid, p_old text, p_new text)
returns integer language plpgsql security definer set search_path = public as $$
declare n integer := 0; st text := 'joined';
begin
  p_new := btrim(p_new);
  if p_device is null or p_new is null or char_length(p_new) not between 1 and 40 or p_new = p_old then return 0; end if;
  if exists (select 1 from members where room_code = p_room and name = p_new and device_id is not null and device_id <> p_device) then
    raise exception 'name taken';
  end if;
  update krathongs set author = p_new where room_code = p_room and device_id = p_device and author = p_old;
  get diagnostics n = row_count;
  if n > 0 then
    update krathongs set tags = array_replace(tags, p_old, p_new) where room_code = p_room and p_old = any(tags);
    update krathongs set for_name = p_new where room_code = p_room and for_name = p_old;
    st := 'floated';
  end if;
  if exists (select 1 from members where room_code = p_room and name = p_old and status = 'floated' and (device_id = p_device or device_id is null)) then st := 'floated'; end if;
  delete from members where room_code = p_room and name = p_old and (device_id = p_device or device_id is null);
  insert into members (room_code, name, status, device_id, updated_at) values (p_room, p_new, st, p_device, now())
  on conflict (room_code, name) do update set device_id = excluded.device_id,
    status = case when members.status = 'floated' or excluded.status = 'floated' then 'floated' else 'joined' end,
    updated_at = now();
  return n;
end $$;
revoke all on function public.rename_me(text, uuid, text, text) from public;
grant execute on function public.rename_me(text, uuid, text, text) to anon, authenticated;

-- v5: ผู้ดูแลลบกระทงที่ไม่เหมาะสม -------------------------------------------
create table if not exists public.app_admin (id int primary key default 1 check (id = 1), key_hash text not null);
alter table public.app_admin enable row level security;
revoke all on public.app_admin from anon, authenticated;
create or replace function public.admin_check(p_key text) returns boolean
language sql security definer set search_path = public, extensions as $$
  select exists (select 1 from public.app_admin where key_hash = extensions.crypt(p_key, key_hash));
$$;
create or replace function public.admin_delete_krathong(p_key text, p_id uuid) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.admin_check(p_key) then raise exception 'not allowed'; end if;
  delete from public.krathongs where id = p_id;
  return found;
end $$;
revoke all on function public.admin_check(text) from public;
revoke all on function public.admin_delete_krathong(text, uuid) from public;
grant execute on function public.admin_check(text) to anon, authenticated;
grant execute on function public.admin_delete_krathong(text, uuid) to anon, authenticated;
-- ตั้งรหัสผู้ดูแล (เจ้าของเว็บรันเองใน SQL Editor แล้วเปลี่ยนข้อความในเครื่องหมาย ' ' เป็นรหัสของตัวเอง):
-- insert into public.app_admin (id, key_hash) values (1, extensions.crypt('ใส่รหัสยาว ๆ ที่นี่', extensions.gen_salt('bf')))
-- on conflict (id) do update set key_hash = excluded.key_hash;
