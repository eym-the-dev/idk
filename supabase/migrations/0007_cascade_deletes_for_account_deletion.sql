-- Hesap silme özelliği eklendi. auth.users -> public.users zaten CASCADE
-- (0001_init.sql), ama public.users'a bağlı diğer tabloların çoğunda
-- CASCADE tanımlı DEĞİLDI — yani bir kullanıcıyı silmeye çalışınca
-- feedback_responses / friendships / dm / watch_rooms gibi tablolardaki
-- satırlar "foreign key violation" hatasıyla silmeyi engelliyordu.
-- Bu migration hepsini CASCADE'e çeviriyor: hesap silinince kullanıcıya
-- ait HER ŞEY (mesajlar, arkadaşlıklar, feedback geçmişi, odalar) de
-- otomatik silinir.

alter table public.feedback_responses drop constraint if exists feedback_responses_user_id_fkey;
alter table public.feedback_responses add constraint feedback_responses_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

alter table public.onboarding_answers drop constraint if exists onboarding_answers_user_id_fkey;
alter table public.onboarding_answers add constraint onboarding_answers_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

alter table public.friendships drop constraint if exists friendships_requester_id_fkey;
alter table public.friendships add constraint friendships_requester_id_fkey
  foreign key (requester_id) references public.users(id) on delete cascade;

alter table public.friendships drop constraint if exists friendships_addressee_id_fkey;
alter table public.friendships add constraint friendships_addressee_id_fkey
  foreign key (addressee_id) references public.users(id) on delete cascade;

alter table public.dm_threads drop constraint if exists dm_threads_user_a_fkey;
alter table public.dm_threads add constraint dm_threads_user_a_fkey
  foreign key (user_a) references public.users(id) on delete cascade;

alter table public.dm_threads drop constraint if exists dm_threads_user_b_fkey;
alter table public.dm_threads add constraint dm_threads_user_b_fkey
  foreign key (user_b) references public.users(id) on delete cascade;

alter table public.dm_messages drop constraint if exists dm_messages_sender_id_fkey;
alter table public.dm_messages add constraint dm_messages_sender_id_fkey
  foreign key (sender_id) references public.users(id) on delete cascade;

alter table public.watch_rooms drop constraint if exists watch_rooms_host_id_fkey;
alter table public.watch_rooms add constraint watch_rooms_host_id_fkey
  foreign key (host_id) references public.users(id) on delete cascade;

alter table public.watch_room_members drop constraint if exists watch_room_members_user_id_fkey;
alter table public.watch_room_members add constraint watch_room_members_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

alter table public.dynamic_prompt_cache drop constraint if exists dynamic_prompt_cache_user_id_fkey;
alter table public.dynamic_prompt_cache add constraint dynamic_prompt_cache_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;
