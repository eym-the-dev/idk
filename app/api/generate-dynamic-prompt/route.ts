import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import {
  buildDynamicPromptCacheKey,
  getAiOptionBySlug,
  isPromptQuizComplete,
  summarizePromptQuiz,
  type PromptQuizAnswers,
} from '@/lib/prompt-engine/promptWizard';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

type TasteProfile = {
  current_mood: string | null;
  preferred_vibe: string | null;
  disliked_genres: string[] | null;
  taste_vector: Record<string, number> | null;
};

function buildFallbackPrompt(params: {
  aiName: string;
  answersSummary: string;
  profile: TasteProfile | null;
  modelAngle: string;
}) {
  const { aiName, answersSummary, profile, modelAngle } = params;

  return [
    `${aiName} için hazırlanmış izleme kişiliği özeti:`,
    '',
    'Bu kullanıcı genelde şunlara yakın duruyor:',
    `- Mod: ${profile?.current_mood ?? 'belirtilmedi'}`,
    `- Vibe: ${profile?.preferred_vibe ?? 'belirtilmedi'}`,
    `- Kaçınılacak türler: ${profile?.disliked_genres?.join(', ') || 'yok'}`,
    `- Zevk vektörü: ${JSON.stringify(profile?.taste_vector ?? {})}`,
    '',
    'Prompt tercihleri:',
    answersSummary
      .split('\n')
      .map((line) => `- ${line}`)
      .join('\n'),
    '',
    'Model yönlendirmesi:',
    modelAngle.replaceAll('"', ''),
    '',
    'Özet:',
    '- Karanlıkta kaybolmak değil, tam isabetli keşif yapmak istiyor.',
    '- Hızlı tüketilen ama yüzeysel olmayan seçimlerden hoşlanıyor.',
    '- Ruh haline uyan, tekrar hissi vermeyen ve karakterli yapımlar arıyor.',
    '- Bu metin Gemini gibi bir öneri motoruna verildiğinde, kullanıcının izleme DNA’sını hızlıca anlatmalı.',
  ].join('\n');
}

// Bu route SADECE sunucuda çalışır (Next.js Route Handler). GEMINI_API_KEY
// .env.local içinde NEXT_PUBLIC_ öneki OLMADAN duruyor — bu yüzden tarayıcıya
// asla gönderilmez, sadece bu dosyanın çalıştığı sunucu süreci görür.
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const selectedAiSlug =
    typeof body?.selectedAiSlug === 'string' ? body.selectedAiSlug.trim() : '';
  const customAiName = typeof body?.customAiName === 'string' ? body.customAiName.trim() : '';
  const answers =
    body?.answers && typeof body.answers === 'object' ? (body.answers as PromptQuizAnswers) : {};

  if (!selectedAiSlug) {
    return NextResponse.json({ error: 'selectedAiSlug gerekli' }, { status: 400 });
  }

  if (!isPromptQuizComplete(answers)) {
    return NextResponse.json({ error: '4 sorunun da cevaplanması gerekli' }, { status: 400 });
  }

  if (selectedAiSlug === 'custom' && !customAiName) {
    return NextResponse.json({ error: 'customAiName gerekli' }, { status: 400 });
  }

  const selectedAi = getAiOptionBySlug(selectedAiSlug);
  const resolvedAiName =
    selectedAiSlug === 'custom'
      ? customAiName.slice(0, 60)
      : selectedAi?.name ?? selectedAiSlug.slice(0, 60);

  if (!resolvedAiName) {
    return NextResponse.json({ error: 'Geçerli bir AI seçimi gerekli' }, { status: 400 });
  }

  const cacheKey = buildDynamicPromptCacheKey({
    selectedAiSlug,
    customAiName: resolvedAiName,
    answers,
  });

  // Aynı kullanıcı + aynı AI + aynı cevap kombinasyonu için ikinci kez
  // Gemini'ye istek atılmaz.
  const cachedQuery = await supabase
    .from('dynamic_prompt_cache')
    .select('generated_prompt')
    .eq('user_id', user.id)
    .eq('custom_ai_name', cacheKey)
    .maybeSingle();
  const cached = cachedQuery.data as { generated_prompt: string } | null;

  if (cached) {
    return NextResponse.json({ prompt: cached.generated_prompt, fromCache: true });
  }

  // 2) Kullanıcının zevk profili
  const profileQuery = await supabase
    .from('user_profiles')
    .select('current_mood, preferred_vibe, disliked_genres, taste_vector')
    .eq('user_id', user.id)
    .single();
  const profile = profileQuery.data as {
    current_mood: string | null;
    preferred_vibe: string | null;
    disliked_genres: string[] | null;
    taste_vector: Record<string, number> | null;
  } | null;

  const modelAngle =
    selectedAiSlug === 'custom'
      ? `"${resolvedAiName}" adlı model için genel güçlü yönlere uyumlu, esnek ama net bir ton kur.`
      : `"${resolvedAiName}" için özellikle şu karakteristiği kullan: ${selectedAi?.tagline} Güçlü yönler: ${selectedAi?.strengths?.join(', ')}.`;
  const answersSummary = summarizePromptQuiz(answers);

  const metaInstruction = `Sen çok iyi bir film-dizi kişilik analisti ve öneri küratörüsün.

Görevin: Aşağıdaki kullanıcı için, bir sonraki adımda Gemini'nin film/dizi önerileri üretebilmesi için hazırlanmış, yapıştırılabilir ve çok net bir "izleme kişiliği özeti" yazmak.

Bu metnin amacı sadece kullanıcıyı tanımlamak değil; aynı zamanda sonraki aşamada Gemini'nin ona doğru öneriler sunabilmesi için yeterli ve net bir kişilik DNA'sı oluşturmak.

Kullanıcı profili:
- Ruh hali: ${profile?.current_mood ?? 'belirtilmedi'}
- Aradığı vibe: ${profile?.preferred_vibe ?? 'belirtilmedi'}
- Kaçınmak istediği türler: ${profile?.disliked_genres?.join(', ') || 'yok'}
- Zevk vektörü: ${JSON.stringify(profile?.taste_vector ?? {})}

Kullanıcının seçimleri:
${answersSummary}

Model yönlendirmesi:
${modelAngle}

Önemli kurallar:
- Sadece nihai kişilik özetini yaz.
- Türkçe yaz.
- 2 ila 4 kısa paragraf olsun.
- Kullanıcının ruh halini, tercihlerini, kaçındığı türleri ve ne tür içeriklerden hoşlandığını net anlat.
- Film/dizi adı yazma; sadece kişiliği tanımla.
- Özeti çok soyut yapma; somut, net, kullanışlı ve yapıştırılabilir yaz.
- Sonraki aşamada Gemini'nin doğrudan bu metni kullanıp 8 film/dizi önerisi ve izlenecekler listesi çıkarması için yeterli bağlam sağlayacak şekilde yaz.

Çıktı formatı:
- Kopyala-yapıştır hazır olsun.
- Çok uzun olmasın.
- Geniş ve süslü dil kullanma.
- Basit, net ve etkili bir kişilik özeti olsun.

Şimdi sadece nihai izleme kişiliği özetini üret.`;

  const fallbackPrompt = buildFallbackPrompt({
    aiName: resolvedAiName,
    answersSummary,
    profile,
    modelAngle,
  });

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    const cacheInsert: Database['public']['Tables']['dynamic_prompt_cache']['Insert'] = {
      user_id: user.id,
      custom_ai_name: cacheKey,
      generated_prompt: fallbackPrompt,
    };

    await (supabase.from('dynamic_prompt_cache') as any).insert(cacheInsert);
    return NextResponse.json({ prompt: fallbackPrompt, fromCache: false, fallback: true });
  }

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: metaInstruction }] }],
      generationConfig: { temperature: 0.55, maxOutputTokens: 900 },
    }),
  });

  if (!geminiRes.ok) {
    const cacheInsert: Database['public']['Tables']['dynamic_prompt_cache']['Insert'] = {
      user_id: user.id,
      custom_ai_name: cacheKey,
      generated_prompt: fallbackPrompt,
    };

    await (supabase.from('dynamic_prompt_cache') as any).insert(cacheInsert);
    return NextResponse.json({ prompt: fallbackPrompt, fromCache: false, fallback: true });
  }

  const geminiData = await geminiRes.json();
  const generatedPrompt: string | undefined =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedPrompt) {
    const cacheInsert: Database['public']['Tables']['dynamic_prompt_cache']['Insert'] = {
      user_id: user.id,
      custom_ai_name: cacheKey,
      generated_prompt: fallbackPrompt,
    };

    await (supabase.from('dynamic_prompt_cache') as any).insert(cacheInsert);
    return NextResponse.json({ prompt: fallbackPrompt, fromCache: false, fallback: true });
  }

  // Aynı seçim ve cevap kombinasyonu için bir daha üretim yapılmaz.
  const cacheInsert: Database['public']['Tables']['dynamic_prompt_cache']['Insert'] = {
    user_id: user.id,
    custom_ai_name: cacheKey,
    generated_prompt: generatedPrompt,
  };

  await (supabase.from('dynamic_prompt_cache') as any).insert(cacheInsert);

  return NextResponse.json({ prompt: generatedPrompt, fromCache: false });
}
