export type TasteVector = Record<string, number>;

type OnboardingAnswers = {
  current_mood?: string;
  preferred_vibe?: string;
  disliked_genres?: string; // tek seçim UI'da tek string, çoklu seçim eklenirse dizi olur
  content_length?: string;
};

// Etiketleri normalize eden basit sözlük — kullanıcı arayüzündeki Türkçe
// metni, taste_vector içinde tutarlı anahtarlara çevirir.
const MOOD_KEY: Record<string, string> = {
  Enerjik: 'mood:energetic',
  Sakin: 'mood:calm',
  Düşünceli: 'mood:reflective',
  'Eğlence arıyorum': 'mood:fun_seeking',
};

const VIBE_KEY: Record<string, string> = {
  'Motive edici': 'vibe:motivational',
  Rahatlatıcı: 'vibe:relaxing',
  'Zihin açıcı': 'vibe:mind_opening',
  'Sadece keyifli': 'vibe:light_fun',
};

const GENRE_KEY: Record<string, string> = {
  Dram: 'genre:drama',
  Korku: 'genre:horror',
  'Politik içerik': 'genre:political',
};

const LENGTH_KEY: Record<string, string> = {
  'Kısa (<15dk)': 'length:short',
  Orta: 'length:medium',
  Uzun: 'length:long',
};

const POSITIVE_WEIGHT = 1;
const NEGATIVE_WEIGHT = -1;
// Yeni sinyal geldiğinde eskisini tamamen silmemek için üstel yumuşatma —
// kullanıcı zevki zamanla kayarsa eski veri aniden sıfırlanmaz, azalarak solar.
const DECAY = 0.85;

/**
 * Mevcut taste_vector'ü onboarding cevaplarıyla günceller.
 * Saf fonksiyon: DB'ye yazmaz, sadece yeni vektörü döndürür — çağıran taraf
 * (profil-tamamla sayfası) sonucu user_profiles.taste_vector'e kaydeder.
 */
export function scoreOnboardingAnswers(
  current: TasteVector,
  answers: OnboardingAnswers
): TasteVector {
  const next: TasteVector = {};
  for (const [key, value] of Object.entries(current)) {
    next[key] = Number((value * DECAY).toFixed(3));
  }

  const bump = (key: string | undefined, weight: number) => {
    if (!key) return;
    next[key] = Number(((next[key] ?? 0) + weight).toFixed(3));
  };

  bump(MOOD_KEY[answers.current_mood ?? ''], POSITIVE_WEIGHT);
  bump(VIBE_KEY[answers.preferred_vibe ?? ''], POSITIVE_WEIGHT);
  bump(GENRE_KEY[answers.disliked_genres ?? ''], NEGATIVE_WEIGHT);
  bump(LENGTH_KEY[answers.content_length ?? ''], POSITIVE_WEIGHT);

  return next;
}
