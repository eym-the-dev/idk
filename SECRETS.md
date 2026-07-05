# I-D-K — Secrets Rehberi

**Önce oku:** Gerçek key'leri hiçbir zaman git'e commit etme. `.env.local`
dosyaları zaten `.gitignore`'da.

Artık her şey **tek bir `.env.local` dosyasında** (web için) — ayrı bir
Supabase Secrets/CLI adımı yok. Tek fark şu: `NEXT_PUBLIC_` önekli olanlar
tarayıcıya gider (herkese açık), öneki olmayanlar sadece sunucuda kalır.

## 1) `web/.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Öneksiz — sadece sunucu tarafında (app/api/.../route.ts) okunur.
GEMINI_API_KEY=

# ÇOK HASSAS — RLS'i tamamen bypass eder, sadece hesap silme endpoint'inde
# kullanılır. Supabase Dashboard → Settings → API → "service_role" (secret).
SUPABASE_SERVICE_ROLE_KEY=
```

- **SUPABASE_URL / ANON_KEY**: Supabase Dashboard → Settings → API. `anon
  key`'in public olması tasarım gereği — RLS zaten koruyor.
- **GEMINI_API_KEY**: Google AI Studio'dan al. Önceki bir mesajda
  paylaştığın key'i AI Studio'dan iptal edip yeni bir tane oluşturman
  gerekiyor (o key artık sohbet geçmişinde göründüğü için güvenli değil).
  Bu key `NEXT_PUBLIC_` öneki OLMADAN duruyor, yani sadece
  `app/api/generate-dynamic-prompt/route.ts` içinden, sunucu tarafında
  okunuyor — tarayıcıya asla gitmiyor.
- **SUPABASE_SERVICE_ROLE_KEY**: Hesap silme özelliği için gerekli — bir
  kullanıcının `auth.users` kaydını silmek normal `anon key` ile mümkün
  değil (RLS ne olursa olsun engeller), bu yetki sadece service_role'de
  var. Bu key'i ASLA `NEXT_PUBLIC_` öneki ile kullanma, ASLA client
  component'e import etme — sadece `app/api/account/delete/route.ts`
  gibi sunucu route'larında.

## 2) OAuth Provider Secrets — .env dosyasına değil, Supabase Dashboard'a girilir

Bunlar Next.js kodunun hiç görmediği değerler; doğrudan **Supabase
Dashboard → Authentication → Providers** ekranına giriliyor (bu bir
altyapı zorunluluğu — Supabase'in kendisi bu bilgiyi orada tutuyor):

**Google:** Client ID + Client Secret → Google Cloud Console → APIs &
Services → Credentials. Redirect URI: `https://<proje-ref>.supabase.co/auth/v1/callback`

**Apple:** Services ID (Client ID), Team ID, Key ID, Private Key (.p8
içeriği) → Apple Developer → Certificates, IDs & Profiles. Aynı redirect URI.

## 3) `mobile/.env.local`

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Prodüksiyon build'i için aynı değerleri EAS'e de tanıt:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "..."
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
```

---

## Toplu doldurma sırası

1. Supabase projeni oluştur → URL + anon key'i `web/.env.local`'a yapıştır.
2. Aynı ikisini `mobile/.env.local`'a `EXPO_PUBLIC_` önekiyle yapıştır.
3. Yeni bir Gemini key oluştur (eskisini iptal ettikten sonra) →
   `web/.env.local`'a `GEMINI_API_KEY=` olarak yapıştır.
4. Google Cloud Console'da OAuth client oluştur → Supabase Dashboard'a gir.
5. Apple Developer hesabından Services ID + Key oluştur → Supabase
   Dashboard'a gir.
6. **E-posta ile kayıt için:** Supabase Dashboard → Authentication →
   Providers → Email → "Confirm email" açık olduğundan emin ol (varsayılan
   zaten açık). Authentication → URL Configuration → Site URL ve Redirect
   URLs alanına sitenin adresini (örn. `http://localhost:3000` ve
   prod URL'in) ekle — yoksa doğrulama maili gelen link çalışmaz.
