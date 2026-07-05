-- E-posta/şifre ile kayıt eklendiği için provider constraint'ine 'email'i
-- ekliyoruz. Zaten 0001_init.sql'i çalıştırdıysan bunu da SQL Editor'de
-- ayrıca çalıştır.

alter table public.users drop constraint if exists users_provider_check;
alter table public.users add constraint users_provider_check
  check (provider in ('google', 'apple', 'email'));
