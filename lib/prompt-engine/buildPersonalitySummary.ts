import { getAiOptionBySlug } from '@/lib/prompt-engine/promptWizard';

type TasteProfile = {
  current_mood: string | null;
  preferred_vibe: string | null;
  disliked_genres: string[] | null;
  taste_vector: Record<string, number> | null;
};

const VECTOR_LABELS: Record<string, string> = {
  'mood:energetic': 'enerjik mod',
  'mood:calm': 'sakin tempo',
  'mood:reflective': 'düşünceli ruh hali',
  'mood:fun_seeking': 'eğlence arayışı',
  'vibe:motivational': 'motive edici ton',
  'vibe:relaxing': 'rahatlatıcı atmosfer',
  'vibe:mind_opening': 'zihin açıcı içerik',
  'vibe:light_fun': 'hafif keyif',
  'genre:drama': 'dramdan kaçınma',
  'genre:horror': 'korkudan kaçınma',
  'genre:political': 'politik içerikten kaçınma',
  'length:short': 'kısa format tercihi',
  'length:medium': 'orta uzunluk tercihi',
  'length:long': 'uzun format tercihi',
};

function describeTasteVector(vector: Record<string, number> | null): string {
  if (!vector || Object.keys(vector).length === 0) return '';

  const signals = Object.entries(vector)
    .filter(([, weight]) => Math.abs(weight) >= 0.3)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 4)
    .map(([key, weight]) => {
      const label = VECTOR_LABELS[key] ?? key;
      return weight > 0 ? label : `${label} (negatif sinyal)`;
    });

  if (signals.length === 0) return '';
  return signals.join(', ');
}

const MODEL_INTROS: Record<string, string> = {
  chatgpt:
    'Net, dengeli ve yapılandırılmış bir izleyici profili çıkarıyorum. Karar vermekten yorulmak istemiyorsun; doğru öneri hızlı gelsin ama rastgele hissettirmesin.',
  claude:
    'Derin ve seçici bir izleme zevkin var. Yüzeysel popülerlik seni ikna etmez; karakter, ton ve duygusal derinlik senin için belirleyici.',
  gemini:
    'Pratik ve meraklı bir izleyicisin. Hızlı keşif sever, güncel ve akıcı öneriler seni yakalar; ama boş tüketim de istemezsin.',
};

/**
 * Profilden okunabilir bir "izleme kişiliği özeti" üretir.
 * Statik model akışında gösterilen metin budur — Gemini'ye beslenecek DNA.
 */
export function buildPersonalitySummary(profile: TasteProfile | null, aiSlug: string): string {
  const ai = getAiOptionBySlug(aiSlug);
  const modelName = ai?.name ?? aiSlug;
  const intro = MODEL_INTROS[aiSlug] ?? `${modelName} lensiyle bakıldığında net bir izleme profili görünüyor.`;

  const mood = profile?.current_mood ?? 'henüz belirtilmedi';
  const vibe = profile?.preferred_vibe ?? 'henüz belirtilmedi';
  const avoid =
    profile?.disliked_genres?.length ? profile.disliked_genres.join(', ') : 'belirli bir kaçınma yok';
  const vectorHint = describeTasteVector(profile?.taste_vector ?? null);

  const paragraphs = [
    intro,
    `Şu an ${mood.toLowerCase()} bir moddasın ve ${vibe.toLowerCase()} bir vibe arıyorsun. İçerik seçerken rastgele kaybolmak değil, ruh haline tam oturan yapımlara gitmek istiyorsun.`,
    `${avoid === 'belirli bir kaçınma yok' ? 'Belirgin bir tür kaçınman yok; ama zayıf eşleşmeler seni hızla soğutur.' : `${avoid} tarzında işler seni çekmiyor — öneriler bu sınırları aşmamalı.`} Seçimlerin "neden bu?" sorusuna tek cümlede cevap verebilmeli.`,
  ];

  if (vectorHint) {
    paragraphs.push(
      `Zevk sinyallerin şunu söylüyor: ${vectorHint}. Bu, önerilerin hem hızlı tüketilebilir hem de boş hissettirmeyecek kadar karakterli olması gerektiğini gösteriyor.`
    );
  }

  paragraphs.push(
    `${modelName} tonunda özet: senin için iyi bir öneri, modunu okuyan, vibe'ına uyan ve tekrar tekrar "evet, tam benlik" dedirten bir yapım. Liste değil, isabetli keşif arıyorsun.`
  );

  return paragraphs.join('\n\n');
}
