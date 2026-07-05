-- I-D-K — çekirdek şema
-- Not: auth.users Supabase tarafından zaten yönetiliyor; public.users bunun
-- üzerine kurulan uygulama profili.

-- ========== KULLANICI & PROFİL ==========
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,              -- DM/arkadaşlık için tekil kimlik, örn: "@ayse"
  display_name text,
  avatar_url text,
  provider text check (provider in ('google','apple','email')),
  created_at timestamptz default now()
);

-- Kullanıcı adı aramaları case-insensitive olmalı; username zaten
-- normalize edilerek (lowercase) yazılıyor ama ekstra güvence için index:
create unique index users_username_lower_idx on public.users (lower(username));

create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  current_mood text,
  disliked_genres text[],
  preferred_vibe text,
  taste_vector jsonb default '{}',
  digital_footprint_raw jsonb,
  onboarding_completed boolean default false,
  updated_at timestamptz default now()
);

-- ========== AI MODELLERİ & PROMPT CACHE ==========
create table public.ai_models (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  is_dynamic boolean default false
);

insert into public.ai_models (slug, display_name, is_dynamic) values
  ('chatgpt', 'ChatGPT', false),
  ('gemini', 'Gemini', false),
  ('claude', 'Claude', false),
  ('custom', 'Diğer', true);

create table public.static_prompts (
  id uuid primary key default gen_random_uuid(),
  ai_model_id uuid references public.ai_models(id),
  version int default 1,
  prompt_template text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.dynamic_prompt_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  custom_ai_name text not null,
  generated_prompt text not null,
  created_at timestamptz default now()
);

-- ========== FEEDBACK LOOP ==========
create table public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  ai_model_id uuid references public.ai_models(id),
  raw_response text not null,
  parsed_signals jsonb,
  created_at timestamptz default now()
);

-- ========== ONBOARDING SORULARI ==========
create table public.onboarding_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  question_type text check (question_type in ('single_select','multi_select','free_text')),
  options jsonb,
  order_index int
);

create table public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  question_id uuid references public.onboarding_questions(id),
  answer jsonb,
  created_at timestamptz default now()
);

-- ========== SOSYAL: ARKADAŞLIK & DM ==========
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.users(id) on delete cascade,
  addressee_id uuid references public.users(id) on delete cascade,
  status text check (status in ('pending','accepted','blocked')) default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, addressee_id)
);

create table public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references public.users(id) on delete cascade,
  user_b uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

create table public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.dm_threads(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- ========== BERABER İZLEME (WATCH PARTY) ==========
create table public.watch_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references public.users(id) on delete cascade,
  content_ref text,
  playback_state jsonb default '{"position":0,"is_playing":false}',
  created_at timestamptz default now()
);

create table public.watch_room_members (
  room_id uuid references public.watch_rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- ========== EASTER EGG KAYITLARI ==========
create table public.easter_egg_triggers (
  id uuid primary key default gen_random_uuid(),
  trigger_key text unique not null,
  trigger_condition text not null,
  reveal_content text not null,
  is_active boolean default true
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.friendships enable row level security;
alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;
alter table public.watch_rooms enable row level security;
alter table public.watch_room_members enable row level security;
alter table public.dynamic_prompt_cache enable row level security;

-- users: herkes (giriş yapmış) temel profilleri görebilir (arkadaş bulma,
-- DM için gerekli) ama sadece kendi satırını güncelleyebilir.
create policy "users_select_all_authenticated" on public.users
  for select using (auth.role() = 'authenticated');
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

-- user_profiles: sadece kendi profilin
create policy "profiles_own_all" on public.user_profiles
  for all using (auth.uid() = user_id);

create policy "feedback_own_all" on public.feedback_responses
  for all using (auth.uid() = user_id);

create policy "onboarding_answers_own_all" on public.onboarding_answers
  for all using (auth.uid() = user_id);

create policy "dynamic_prompt_cache_own_all" on public.dynamic_prompt_cache
  for all using (auth.uid() = user_id);

-- friendships: istek gönderen veya alan taraf görebilir/güncelleyebilir
create policy "friendships_participant" on public.friendships
  for all using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- dm_threads / dm_messages: sadece thread'in iki tarafı erişebilir
create policy "dm_threads_participant" on public.dm_threads
  for all using (auth.uid() = user_a or auth.uid() = user_b);

create policy "dm_messages_participant" on public.dm_messages
  for all using (
    exists (
      select 1 from public.dm_threads t
      where t.id = thread_id and (t.user_a = auth.uid() or t.user_b = auth.uid())
    )
  );

-- watch_rooms / members: oda üyeleri erişebilir, herkes odayı keşfedebilir (select)
create policy "watch_rooms_select_all" on public.watch_rooms
  for select using (auth.role() = 'authenticated');
create policy "watch_rooms_host_write" on public.watch_rooms
  for all using (auth.uid() = host_id);

create policy "watch_room_members_participant" on public.watch_room_members
  for all using (
    auth.uid() = user_id or
    exists (select 1 from public.watch_rooms r where r.id = room_id and r.host_id = auth.uid())
  );

-- ai_models / static_prompts / easter_egg_triggers: herkese açık okuma,
-- yazma sadece servis rolü (admin) üzerinden yapılır (RLS insert/update
-- policy'si kasıtlı olarak eklenmedi).
alter table public.ai_models enable row level security;
alter table public.static_prompts enable row level security;
alter table public.easter_egg_triggers enable row level security;

create policy "ai_models_read_all" on public.ai_models for select using (true);
create policy "static_prompts_read_all" on public.static_prompts for select using (true);
create policy "easter_eggs_read_all" on public.easter_egg_triggers for select using (true);
