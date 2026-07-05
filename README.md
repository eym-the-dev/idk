# I-D-K

Ne izleyeceğini sen bilmiyorsun. Biz biliyoruz.

Alışkanlıklarından öğrenen, popüler AI'lar için hazır (token harcamayan)
prompt üreten, kişiselleştirilmiş içerik öneri motoru.

## Kurulum

```bash
npm install
cp .env.example .env.local   # SECRETS.md'ye bakarak doldur
npm run dev
```

### Supabase tarafı
1. Yeni bir Supabase projesi oluştur.
2. `supabase/migrations/` içindeki dosyaları **sırayla** (0001'den 0007'ye)
   SQL Editor'de çalıştır (ya da `supabase db push`).
   Çalıştırdıktan sonra Table Editor'de `users` tablosunun göründüğünü
   doğrula — "Could not find the table" hatası genelde bu adımın
   atlanmasından kaynaklanır.
3. Authentication → Providers'tan **Google** ve **Apple** OAuth'u etkinleştir,
   redirect URL olarak `https://<proje-ref>.supabase.co/auth/v1/callback` gir.
4. Authentication → Providers → **Email**'den "Confirm email"in açık
   olduğundan emin ol (e-posta ile kayıtta doğrulama zorunlu olsun diye).
5. Authentication → **URL Configuration**'a Site URL ve Redirect URLs
   olarak sitenin adresini ekle (örn. `http://localhost:3000`) — yoksa
   doğrulama maili çalışmaz.
6. `.env.local` içine tüm değerleri yapıştır — detaylar `SECRETS.md`'de.
7. (Opsiyonel) `npm run supabase:types` ile `types/database.types.ts`
   dosyasını gerçek şemadan otomatik üret.

## Tasarım sistemi — "ıslak mürekkep siyahı"

Kesin bir marka kararı: parlak neon değil, düşük ışıklı, dokulu bir karanlık.
Tek bir vurgu rengi (saten altın) tüm paletin taşıyıcısı.

| Token | Hex | Kullanım |
|---|---|---|
| `void` | `#0A0A0B` | sayfa zemini |
| `surface` | `#141416` | kart zemini |
| `surface-raised` | `#1D1D20` | hover / yükseltilmiş yüzey |
| `hairline` | `#29292D` | ince ayraç |
| `ivory` | `#F3F0E9` | birincil metin (kırık beyaz) |
| `dust` | `#96938C` | ikincil metin |
| `gold` | `#C6A15B` | tek vurgu rengi — CTA, aktif durum, imza |
| `emerald` | `#2E6E52` | başarı / çevrimiçi |
| `rust` | `#A8462F` | hata |

**Tipografi:** `Fraunces` (italik serif) başlıklarda ve wordmark'ta —
markanın karakterini taşıyan tek unsur. `Inter` arayüz/gövde metninde.
`IBM Plex Mono`, adım etiketleri gibi "veri" hisli küçük detaylarda
(`ADIM 01`, `@kullaniciadi`).

**İmza öğe:** `components/ui/Logo.tsx` — harfleri altın noktalarla ayıran
`I·D·K` wordmark'ı. `pulsing` prop'u açıldığında noktalar sırayla yanıp
söner; bu, uygulamanın "öğreniyorum" hissini tek bir mikro-animasyonla
taşıyan tekrar eden motif. Giriş ekranında, profil tamamlama seansının
açılışında ve ileride her "düşünme" anında yeniden kullanılacak.

**Karanlık mod:** Şu an için `forcedTheme="dark"` ile tek tema (bkz.
`lib/theme-provider.tsx`). Açık tema altyapısı (next-themes, class
stratejisi) hazır — ileride tema seçimi istenirse tek satır silinir.

## Klasör yapısı

```
app/
  (auth)/login/            → tek ekran, tek CTA grubu OAuth girişi
  auth/callback/            → OAuth code exchange + ilk kayıt
  (onboarding)/kullanici-adi/    → DM için tekil @kullaniciadi belirleme
  (onboarding)/profil-tamamla/   → feedback-loop sonrası 4 soruluk seans
  (main)/dashboard/         → AI modeli seçim ekranı
  (main)/prompt/[aiModel]/  → sabit prompt + kopyala-yapıştır + feedback
lib/
  supabase/                 → client/server/middleware Supabase bağlantıları
  prompt-engine/            → sabit prompt okuma (AI çağrısı yok)
  easter-eggs/               → "Melisa" tetikleyicileri, izole katman
components/
  ui/                        → Button, Input, Logo (temel atomlar)
  dashboard/, prompt/        → ekrana özel bileşenler
supabase/migrations/         → tüm şema + seed veriler
```

## Sırada ne var

Bu iskelet artık şunları çalışır durumda içeriyor: Google/Apple OAuth
girişi, e-posta + şifre ile kayıt (zorunlu e-posta doğrulamalı) ve giriş,
ilk girişte kullanıcı adı belirleme, **film ve dizi odaklı** AI modeli
seçimi → sabit prompt → kopyala/yapıştır → feedback-loop (artık cevabı
gerçekten ayrıştırıp dashboard'da gösteriyor) → profil tamamlama seansı,
"Diğer AI" için Gemini destekli dinamik prompt üretimi, arkadaşlık +
gerçek zamanlı DM, beraber izleme odaları, PC/telefon için farklılaştırılmış
arayüz, gizli easter egg, **hesap bilgileri sayfası (`/hesap`)** ve
**tam çalışan hesap silme** (kullanıcı adını yazarak onaylama, tüm bağlı
verilerin cascade ile temizlenmesi).

**Secrets:** Tek dosya — `.env.local`. Detaylar `SECRETS.md`'de. Hesap
silme için `SUPABASE_SERVICE_ROLE_KEY` gerekiyor (RLS'i bypass eder,
sadece `app/api/account/delete` içinde kullanılıyor).

Henüz eklenmedi: watch-party'de gerçek video embed entegrasyonu, YouTube
API üzerinden "dijital ayak izi" verisi çekilmesi, `onboarding_questions`
tablosunun dinamik soru kaynağı olarak kullanılması.
