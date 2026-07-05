import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';
import type { DiscoverItem, SavedRecommendations } from '@/lib/prompt-engine/discoverTypes';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function extractJsonBlock(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? match[0] : raw;
}

function buildFallbackRecommendations(
  profile: {
    current_mood: string | null;
    preferred_vibe: string | null;
    disliked_genres: string[] | null;
    taste_vector: Record<string, number> | null;
    onboarding_completed: boolean | null;
  } | null,
  personalitySummary: string
): SavedRecommendations {
  const text = `${personalitySummary} ${profile?.current_mood ?? ''} ${profile?.preferred_vibe ?? ''}`.toLowerCase();
  const isReflective = /calm|reflective|quiet|slow|thought|introspective|gentle/.test(text);
  const isEnergetic = /energetic|playful|light|fun|hopeful|uplifting/.test(text);
  const isMysterious = /mysterious|dark|thriller|mystery|shadow/.test(text);

  const watched = isReflective
    ? [
        {
          title: 'Past Lives',
          year: '2023',
          format: 'Film',
          genres: ['Duygusal', 'Romantik'],
          hook: 'Yavaş ve derin bir bağ kurma hissi veren bir film.',
          whyMatch: 'Düşünceli ve duygusal bir ton arayan kullanıcıya çok iyi oturuyor.',
          vibe: 'Sakin ve düşündürücü',
        },
        {
          title: 'The Queen\'s Gambit',
          year: '2020',
          format: 'Dizi',
          genres: ['Dram', 'Tarihsel'],
          hook: 'Hem karakter odaklı hem de içsel bir ilerleme sunan dizi.',
          whyMatch: 'Ruh halini derinleştiren, güçlü bir karakter yolculuğu arayanlara hitap eder.',
          vibe: 'Düşünceli ve odaklı',
        },
        {
          title: 'Severance',
          year: '2022',
          format: 'Dizi',
          genres: ['Bilimkurgu', 'Psikolojik'],
          hook: 'Birey ve kurum arasındaki gerilimi çok iyi katan dizi.',
          whyMatch: 'Soyut ama çekici bir ritim arayan kullanıcıya iyi gelir.',
          vibe: 'Gizemli ve karanlık',
        },
      ]
    : isEnergetic
      ? [
          {
            title: 'The Bear',
            year: '2022',
            format: 'Dizi',
            genres: ['Komedi', 'Drama'],
            hook: 'Hızlı, yoğun ve çok canlı bir izleme hissi verir.',
            whyMatch: 'Enerjik ve duygusal bir akış isteyenlere çok yakın durur.',
            vibe: 'Coşkulu ve hareketli',
          },
          {
            title: 'Fleabag',
            year: '2016',
            format: 'Dizi',
            genres: ['Komedi', 'Dram'],
            hook: 'Kısa, keskin ve çok eğlenceli bir karakter deneyimi sunar.',
            whyMatch: 'Hafif ama zeki bir ton arayan kullanıcı için rahat bir seçim.',
            vibe: 'Eğlenceli ve keskin',
          },
          {
            title: 'The Grand Budapest Hotel',
            year: '2014',
            format: 'Film',
            genres: ['Komedi', 'Macera'],
            hook: 'Renkli, hızlı ve stilize bir film deneyimi sunar.',
            whyMatch: 'Göz alıcı ve keyifli bir his isteyenlere uygundur.',
            vibe: 'Canlı ve neşeli',
          },
        ]
      : [
          {
            title: 'Severance',
            year: '2022',
            format: 'Dizi',
            genres: ['Bilimkurgu', 'Psikolojik'],
            hook: 'Düşünmeye ve sorgulamaya davet eden bir dizi.',
            whyMatch: 'Genel bir denge arayan kullanıcıya iyi uyan çok yönlü bir seçim.',
            vibe: 'Düşündürücü',
          },
          {
            title: 'The Bear',
            year: '2022',
            format: 'Dizi',
            genres: ['Komedi', 'Drama'],
            hook: 'Duygusal yoğunluğu ve ritmini koruyan bir dizi.',
            whyMatch: 'İnsan odaklı ve karakter temelli içerik arayanlara uygundur.',
            vibe: 'Yoğun ama çekici',
          },
          {
            title: 'Midnight in Paris',
            year: '2011',
            format: 'Film',
            genres: ['Romantik', 'Komedi'],
            hook: 'Yumuşak ve keyifli bir atmosfer sunan film.',
            whyMatch: 'Rahatlatıcı ve hafif bir deneyim isteyenlere uygundur.',
            vibe: 'Sıcak ve rahatlatıcı',
          },
        ];

  const toWatch = isMysterious
    ? [
        {
          title: 'The Leftovers',
          year: '2014',
          format: 'Dizi',
          genres: ['Dram', 'Gizem'],
          hook: 'Kayıp ve anlam arayışını etkileyici biçimde işleyen dizi.',
          whyMatch: 'Gizemli ve duygusal bir hava arayan kullanıcıya çok yakışır.',
          vibe: 'Gizemli ve ağırbaşlı',
        },
        {
          title: 'Sharp Objects',
          year: '2018',
          format: 'Dizi',
          genres: ['Dram', 'Gerilim'],
          hook: 'Yoğun duygusal bir atmosfer ve sert bir karakter gücü sunar.',
          whyMatch: 'Daha karanlık ve düşündürücü bir seçim isteyenlere yakın durur.',
          vibe: 'Karanlık ve gerilimli',
        },
        {
          title: 'Annihilation',
          year: '2018',
          format: 'Film',
          genres: ['Bilimkurgu', 'Gizem'],
          hook: 'Merak ve bilinmeyen arasındaki gerilimi çok güçlü taşıyan film.',
          whyMatch: 'Bilinmeyene ilgi duyan ve yoğun bir ruh hali arayan kullanıcıya uygundur.',
          vibe: 'Gizemli ve yoğun',
        },
        {
          title: 'The Fall',
          year: '2013',
          format: 'Dizi',
          genres: ['Suç', 'Psikolojik'],
          hook: 'Yavaş ama çok dikkat çekici bir gerilim hissi verir.',
          whyMatch: 'Baskın olmayan ama etkili bir gerilimden hoşlanan kullanıcıya uyar.',
          vibe: 'Soğuk ve karanlık',
        },
        {
          title: 'Memento',
          year: '2000',
          format: 'Film',
          genres: ['Gerilim', 'Psikolojik'],
          hook: 'Bellek ve zamanın parçalanmasını çok etkileyici biçimde işler.',
          whyMatch: 'Karmaşık ama akılda kalan bir deneyim arayanlara uygundur.',
          vibe: 'Zihinsel ve düşündürücü',
        },
      ]
    : [
        {
          title: 'The Bear',
          year: '2022',
          format: 'Dizi',
          genres: ['Komedi', 'Drama'],
          hook: 'Yoğun ama bir o kadar da duygusal bir dizi.',
          whyMatch: 'Hızlı, karakter odaklı ve duygusal bir seçim isteyenlere yakın durur.',
          vibe: 'Yoğun ve insani',
        },
        {
          title: 'The White Lotus',
          year: '2021',
          format: 'Dizi',
          genres: ['Komedi', 'Dram'],
          hook: 'Küçük bir toplumun içindeki çatışmaları çok iyi yansıtır.',
          whyMatch: 'Toplumsal ve karakter odaklı bir hava arayan kullanıcıya uyumlu.',
          vibe: 'Keskin ve sosyal',
        },
        {
          title: 'Before Sunset',
          year: '2004',
          format: 'Film',
          genres: ['Romantik', 'Dram'],
          hook: 'Konuşmalar ve duyguların çok doğal akışını sunan film.',
          whyMatch: 'Düşünceli ve yumuşak bir ilişki hissi arayanlara uygundur.',
          vibe: 'Sakin ve duygusal',
        },
        {
          title: 'The Mitchells vs. the Machines',
          year: '2021',
          format: 'Film',
          genres: ['Animasyon', 'Komedi'],
          hook: 'Enerjik ve eğlenceli bir aile yolculuğu sunar.',
          whyMatch: 'Hafif, renkli ve neşeli bir şey isteyenlere çok iyi gelir.',
          vibe: 'Neşeli ve hareketli',
        },
        {
          title: 'Bleak House',
          year: '2005',
          format: 'Dizi',
          genres: ['Dram', 'Tarihsel'],
          hook: 'İnsan ilişkilerini ve sınıf dinamiklerini güçlü biçimde anlatan dizi.',
          whyMatch: 'Daha ağır ama çok kalıcı bir deneyim arayan kullanıcı için iyi bir seçim.',
          vibe: 'Düşündürücü ve zengin',
        },
      ];

  return {
    personalitySummary: personalitySummary || 'Bu kullanıcı için kısa ve etkili bir keşif listesi hazırlandı.',
    shelfTitle: 'Sana göre kısa raf',
    watched,
    toWatch,
    items: toWatch,
  };
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const personalitySummary =
    typeof body?.personalitySummary === 'string' ? body.personalitySummary.trim() : '';
  const aiModelSlug = typeof body?.aiModelSlug === 'string' ? body.aiModelSlug.trim() : 'custom';

  if (!personalitySummary) {
    return NextResponse.json({ error: 'Kişilik özeti eksik.' }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY eksik.' }, { status: 500 });
  }

  const profileQuery = await supabase
    .from('user_profiles')
    .select('current_mood, preferred_vibe, disliked_genres, taste_vector, onboarding_completed')
    .eq('user_id', user.id)
    .single();

  const profile = profileQuery.data as {
    current_mood: string | null;
    preferred_vibe: string | null;
    disliked_genres: string[] | null;
    taste_vector: Record<string, number> | null;
    onboarding_completed: boolean | null;
  } | null;

  const modelQuery = await supabase
    .from('ai_models')
    .select('id, display_name')
    .eq('slug', aiModelSlug)
    .maybeSingle();

  const model = modelQuery.data as { id: string; display_name: string } | null;

  const instruction = `Sen çok iyi bir film-dizi küratörüsün.

Aşağıda kullanıcının izleme kişiliği özeti var:
${personalitySummary}

Kullanıcı profili:
- Ruh hali: ${profile?.current_mood ?? 'belirtilmedi'}
- Aradığı vibe: ${profile?.preferred_vibe ?? 'belirtilmedi'}
- Kaçınmak istediği türler: ${profile?.disliked_genres?.join(', ') || 'yok'}
- Zevk vektörü: ${JSON.stringify(profile?.taste_vector ?? {})}

Tamamlanması gereken görev:
- Kullanıcı için 8 gerçek film veya dizi önerisi ver.
- 3 tanesini "izlenenler" listesine koy, 5 tanesini "izlenecekler" listesine koy.
- Her öneriyi neden bu kullanıcıya uygun olduğunu net söyle.
- Uydurma yapım ismi kullanma.
- Ana akım ve nispeten niş yapımları dengeli karıştır.
- Çok bilinen ama zayıf eşleşen işlerden kaçın.
- Çıktı çok kısa ve net olsun.
- shelfTitle kısa, kişisel ve çekici olsun.

Sadece geçerli JSON döndür. Markdown, açıklama veya kod bloğu ekleme.
Şu şemaya uy:
{
  "personalitySummary": "1-3 cümlelik güçlü bir izleme kişiliği özeti",
  "shelfTitle": "Kısa keşfet başlığı",
  "watched": [
    {
      "title": "Yapım adı",
      "year": "Yıl veya yıl aralığı",
      "format": "Film veya Dizi",
      "genres": ["Tür1", "Tür2"],
      "hook": "Tek cümlelik merak uyandıran cümle",
      "whyMatch": "Bu kullanıcıya neden uyduğunun net açıklaması",
      "vibe": "Hangi ruh halinde izlenmesi gerektiği"
    }
  ],
  "toWatch": [
    {
      "title": "Yapım adı",
      "year": "Yıl veya yıl aralığı",
      "format": "Film veya Dizi",
      "genres": ["Tür1", "Tür2"],
      "hook": "Tek cümlelik merak uyandıran cümle",
      "whyMatch": "Bu kullanıcıya neden uyduğunun net açıklaması",
      "vibe": "Hangi ruh halinde izlenmesi gerektiği"
    }
  ]
}`;

  let parsed: SavedRecommendations | null = null;
  let rawText = '';

  try {
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instruction }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1400,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`gemini_failed:${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      throw new Error('gemini_empty');
    }

    parsed = JSON.parse(extractJsonBlock(rawText)) as SavedRecommendations;
  } catch {
    parsed = buildFallbackRecommendations(profile, personalitySummary);
    rawText = 'Gemini rate limit / API hatası nedeniyle yerel fallback öneriler kullanıldı.';
  }

  if (!parsed?.watched?.length && !parsed?.toWatch?.length && !parsed?.items?.length) {
    parsed = buildFallbackRecommendations(profile, personalitySummary);
  }

  const normalizeItem = (item?: DiscoverItem) => {
    const title = item?.title || 'İsimsiz öneri';
    const format = item?.format || 'Yapım';
    const searchQuery = `${title} ${format === 'Dizi' ? 'dizi' : 'film'} trailer`;

    return {
      title,
      year: item?.year || 'Bilinmiyor',
      format,
      genres: Array.isArray(item?.genres) ? item.genres.slice(0, 3) : [],
      hook: item?.hook || '',
      whyMatch: item?.whyMatch || '',
      vibe: item?.vibe || '',
      imageUrl: item?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(title)}/900/1350`,
      youtubeSearchQuery: item?.youtubeSearchQuery || `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
    };
  };

  const normalized: SavedRecommendations = {
    personalitySummary: parsed.personalitySummary || personalitySummary,
    shelfTitle: parsed.shelfTitle || 'Sana göre keşfet',
    watched: (Array.isArray(parsed.watched) ? parsed.watched : []).slice(0, 3).map(normalizeItem),
    toWatch: (Array.isArray(parsed.toWatch) ? parsed.toWatch : Array.isArray(parsed.items) ? parsed.items : []).slice(0, 8).map(normalizeItem),
    items: (Array.isArray(parsed.toWatch) ? parsed.toWatch : Array.isArray(parsed.items) ? parsed.items : []).slice(0, 8).map(normalizeItem),
  };

  const feedbackInsert: Database['public']['Tables']['feedback_responses']['Insert'] = {
    user_id: user.id,
    ai_model_id: model?.id ?? null,
    raw_response: rawText,
    parsed_signals: normalized as Record<string, unknown>,
  };

  await (supabase.from('feedback_responses') as any).insert(feedbackInsert);

  return NextResponse.json({
    ok: true,
    recommendations: normalized,
    onboardingCompleted: !!profile?.onboarding_completed,
    modelName: model?.display_name ?? 'Gemini',
    fallback: rawText.includes('fallback') || rawText.includes('Gemini'),
  });
}
