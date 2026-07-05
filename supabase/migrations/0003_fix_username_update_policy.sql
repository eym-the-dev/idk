-- Zaten 0001_init.sql'i çalıştırdıysan, bu dosyayı SQL Editor'de ayrıca
-- çalıştır — "kullanıcı adı alınmış" hatasının olası bir kaynağını
-- (RLS UPDATE politikasında WITH CHECK eksikliği) netleştirir.
-- Not: Bu değişiklik davranışı pratikte değiştirmeyebilir (USING zaten
-- id değişmediği için yeterliydi) ama politika niyetini netleştirir ve
-- ileride id dışında bir alan RLS'e eklenirse sürpriz kaçakları önler.

drop policy if exists "users_update_own" on public.users;

create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
