export const PROMPT_QUIZ = [
  {
    id: 'mood',
    title: 'Şu an en çok hangi ruh halindesin?',
    shortTitle: 'Ruh hali',
    options: [
      { id: 'energetic', label: 'Enerjik', hint: 'Hareketli, coşkulu ve aktif bir his.' },
      { id: 'calm', label: 'Sakin', hint: 'Dingin, rahatlatıcı ve huzurlu bir şey istiyorum.' },
      { id: 'reflective', label: 'Düşünceli', hint: 'Duygusal, derin ve düşündüren bir şey.' },
      { id: 'playful', label: 'Eğlenceli', hint: 'Hafif, keyifli ve rahatlatıcı bir şey.' },
    ],
  },
  {
    id: 'tone',
    title: 'Aradığın ton neye yakın olsun?',
    shortTitle: 'Ton',
    options: [
      { id: 'cozy', label: 'Sıcak', hint: 'Kendini iyi hissettiren, rahatlatan bir vibe.' },
      { id: 'sharp', label: 'Keskin', hint: 'Daha cesur, dikkat çekici ve net bir seçim.' },
      { id: 'mysterious', label: 'Gizemli', hint: 'Merak uyandıran, gizemli bir atmosfer.' },
      { id: 'hopeful', label: 'Umutlu', hint: 'Işık, iyimserlik ve rahatlatıcı enerji.' },
    ],
  },
  {
    id: 'avoid',
    title: 'En çok hangi türden kaçınmak istersin?',
    shortTitle: 'Kaçınma',
    options: [
      { id: 'drama', label: 'Dram', hint: 'Aşırı ağır ve yorucu hissettiren şeyler.' },
      { id: 'horror', label: 'Korku', hint: 'Baskın, yoğun ve rahatsız edici içerikler.' },
      { id: 'political', label: 'Politik', hint: 'Siyasi ve ağır temalı şeylerden uzak durmak istiyorum.' },
      { id: 'none', label: 'Yok', hint: 'Çok seçici değilim, çeşit olsun.' },
    ],
  },
  {
    id: 'format',
    title: 'En iyi hangisi senin için?',
    shortTitle: 'Format',
    options: [
      { id: 'film', label: 'Film', hint: 'Tek seferlik, yoğun bir izleme deneyimi.' },
      { id: 'series', label: 'Dizi', hint: 'Uzun soluklu, karakter odaklı bir deneyim.' },
      { id: 'mixed', label: 'Karışık', hint: 'Film ve dizi ikisi de olur.' },
      { id: 'short', label: 'Kısa', hint: 'Hızlı ve hafif bir akış istiyorum.' },
    ],
  },
] as const;

export type PromptQuizQuestion = (typeof PROMPT_QUIZ)[number];
export type PromptQuizQuestionId = PromptQuizQuestion['id'];
export type PromptQuizOptionId = PromptQuizQuestion['options'][number]['id'];
export type PromptQuizAnswers = Partial<Record<PromptQuizQuestionId, PromptQuizOptionId>>;
export type CompletedPromptQuizAnswers = Record<PromptQuizQuestionId, PromptQuizOptionId>;

export const AI_OPTIONS = [
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    badge: 'En dengeli',
    tagline: 'Hız, netlik ve yapı arasında güçlü denge kurar.',
    strengths: ['çok yönlü', 'iyi yapı kurar', 'net çıktı verir'],
  },
  {
    slug: 'claude',
    name: 'Claude',
    badge: 'En derin',
    tagline: 'Daha düşünceli, rafine ve uzun soluklu muhakeme hissi verir.',
    strengths: ['derin düşünür', 'ince ayar sever', 'kalite odaklıdır'],
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    badge: 'Araştırma dostu',
    tagline: 'Hızlı, pratik ve araştırma beklentisine yakın bir his sunar.',
    strengths: ['hızlıdır', 'pratiktir', 'güncel arama beklentisine yakındır'],
  },
  {
    slug: 'custom',
    name: 'Kendi modelim',
    badge: 'Manuel seçim',
    tagline: 'Kullandığın modeli kendin yaz, promptu ona göre optimize edelim.',
    strengths: ['esnek', 'marka bağımsız', 'elle özelleştirilebilir'],
  },
] as const;

export type AiOption = (typeof AI_OPTIONS)[number];
export type AiOptionSlug = AiOption['slug'];

const QUIZ_WEIGHTS: Record<
  PromptQuizQuestionId,
  Record<string, Partial<Record<Exclude<AiOptionSlug, 'custom'>, number>>>
> = {
  mood: {
    energetic: { gemini: 3, chatgpt: 2, claude: 1 },
    calm: { claude: 3, gemini: 2, chatgpt: 1 },
    reflective: { claude: 3, chatgpt: 2, gemini: 1 },
    playful: { chatgpt: 3, gemini: 2, claude: 1 },
  },
  tone: {
    cozy: { claude: 3, chatgpt: 2, gemini: 1 },
    sharp: { gemini: 3, chatgpt: 2, claude: 1 },
    mysterious: { claude: 3, gemini: 2, chatgpt: 1 },
    hopeful: { chatgpt: 3, gemini: 2, claude: 1 },
  },
  avoid: {
    drama: { chatgpt: 2, claude: 3, gemini: 1 },
    horror: { claude: 3, chatgpt: 2, gemini: 1 },
    political: { claude: 3, chatgpt: 2, gemini: 1 },
    none: { chatgpt: 3, gemini: 2, claude: 2 },
  },
  format: {
    film: { gemini: 3, chatgpt: 2, claude: 1 },
    series: { claude: 3, gemini: 2, chatgpt: 1 },
    mixed: { chatgpt: 3, gemini: 2, claude: 2 },
    short: { gemini: 2, chatgpt: 2, claude: 1 },
  },
};

export function isPromptQuizComplete(
  answers: PromptQuizAnswers
): answers is CompletedPromptQuizAnswers {
  return PROMPT_QUIZ.every((question) => {
    const answer = answers[question.id];
    return !!answer && question.options.some((option) => option.id === answer);
  });
}

export function getAiOptionBySlug(slug: string) {
  return AI_OPTIONS.find((option) => option.slug === slug);
}

export function getAnswerMeta(questionId: PromptQuizQuestionId, optionId: string) {
  const question = PROMPT_QUIZ.find((item) => item.id === questionId);
  const option = question?.options.find((item) => item.id === optionId);
  if (!question || !option) return null;

  return {
    questionId,
    questionTitle: question.title,
    questionShortTitle: question.shortTitle,
    optionId: option.id,
    optionLabel: option.label,
    optionHint: option.hint,
  };
}

export function summarizePromptQuiz(answers: CompletedPromptQuizAnswers) {
  return PROMPT_QUIZ.map((question) => {
    const meta = getAnswerMeta(question.id, answers[question.id]);
    return meta
      ? `${meta.questionShortTitle}: ${meta.optionLabel} (${meta.optionHint})`
      : `${question.shortTitle}: belirtilmedi`;
  }).join('\n');
}

export function buildDynamicPromptCacheKey(params: {
  selectedAiSlug: string;
  customAiName?: string;
  answers: CompletedPromptQuizAnswers;
}) {
  const aiPart =
    params.selectedAiSlug === 'custom'
      ? (params.customAiName?.trim() || 'custom')
      : params.selectedAiSlug;

  const answerPart = PROMPT_QUIZ.map((question) => `${question.id}:${params.answers[question.id]}`).join(
    '|'
  );

  return `${aiPart}::${answerPart}`;
}

export function recommendAiModels(answers: CompletedPromptQuizAnswers) {
  const scores: Record<Exclude<AiOptionSlug, 'custom'>, number> = {
    chatgpt: 0,
    claude: 0,
    gemini: 0,
  };

  const reasons = new Map<Exclude<AiOptionSlug, 'custom'>, string[]>();
  reasons.set('chatgpt', []);
  reasons.set('claude', []);
  reasons.set('gemini', []);

  for (const question of PROMPT_QUIZ) {
    const answer = answers[question.id];
    const meta = getAnswerMeta(question.id, answer);
    const weighted = QUIZ_WEIGHTS[question.id][answer] ?? {};

    for (const [slug, value] of Object.entries(weighted) as Array<
      [Exclude<AiOptionSlug, 'custom'>, number]
    >) {
      scores[slug] += value;
      if (value >= 3 && meta) {
        reasons.get(slug)?.push(`${meta.optionLabel.toLowerCase()} beklentine iyi oturuyor`);
      }
    }
  }

  return AI_OPTIONS.filter((option) => option.slug !== 'custom')
    .map((option) => ({
      ...option,
      score: scores[option.slug],
      reason:
        reasons.get(option.slug)?.[0] ??
        `${option.name}, verdiğin cevaplarda güçlü bir genel eşleşme çıkarıyor.`,
    }))
    .sort((a, b) => b.score - a.score);
}
