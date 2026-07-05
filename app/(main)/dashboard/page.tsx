import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ModelCard } from '@/components/dashboard/ModelCard';
import { RecommendationsResult } from '@/components/dashboard/RecommendationsResult';
import { StartGuide } from '@/components/dashboard/StartGuide';
import { QuickChat } from '@/components/chat/QuickChat';
import { AppShell } from '@/components/layout/AppShell';
import type { SavedRecommendations } from '@/lib/prompt-engine/discoverTypes';

const MODELS = [
  { slug: 'chatgpt', name: 'ChatGPT', hint: 'OpenAI' },
  { slug: 'gemini', name: 'Gemini', hint: 'Google' },
  { slug: 'claude', name: 'Claude', hint: 'Anthropic' },
  { slug: 'custom', name: 'Akıllı seçim', hint: '4 kısa soru ile' },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { yeni?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const userRowQuery = await supabase
    .from('users')
    .select('username')
    .eq('id', user.id)
    .single();
  const userRow = userRowQuery.data as { username: string | null } | null;

  const profileQuery = await supabase
    .from('user_profiles')
    .select('current_mood, preferred_vibe, disliked_genres')
    .eq('user_id', user.id)
    .single();
  const profile = profileQuery.data as {
    current_mood: string | null;
    preferred_vibe: string | null;
    disliked_genres: string[] | null;
  } | null;

  // Son bırakılan feedback — varsa bunu "sonuç" olarak gösteriyoruz.
  // Bu, akışın sonunda "hiçbir şey değişmedi" hissini kıran asıl parça.
  const latestFeedbackQuery = await supabase
    .from('feedback_responses')
    .select('parsed_signals, ai_model_id, ai_models(display_name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestFeedback = latestFeedbackQuery.data as
    | {
        parsed_signals: SavedRecommendations | null;
        ai_model_id: string | null;
        ai_models: { display_name: string } | null;
      }
    | null;

  const saved = (latestFeedback?.parsed_signals as SavedRecommendations | null) ?? null;
  const watchedItems = saved?.watched ?? [];
  const toWatchItems = saved?.toWatch ?? saved?.items ?? [];

  const hasResult = !!latestFeedback;

  return (
    <AppShell username={userRow?.username ?? undefined}>
      <div
        className={`px-6 py-10 md:px-12 md:py-14 mx-auto md:mx-0 ${
          hasResult ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        {hasResult && (
          <RecommendationsResult
            profile={profile ?? { current_mood: null, preferred_vibe: null, disliked_genres: null }}
            items={toWatchItems}
            watchedItems={watchedItems}
            toWatchItems={toWatchItems}
            modelName={(latestFeedback?.ai_models as any)?.display_name}
            justUpdated={searchParams.yeni === '1'}
            personalitySummary={saved?.personalitySummary}
            shelfTitle={saved?.shelfTitle}
          />
        )}

        {!hasResult && <StartGuide />}

        <div className="mb-10">
          <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
            {hasResult ? 'yeni öneri al' : 'adım 01'}
          </span>
          <h2 className="font-display text-2xl md:text-3xl text-ivory mt-3">
            Hangi yapay zekayı kullanıyorsun?
          </h2>
          <p className="text-[15px] text-dust mt-2 max-w-md">
            Bu akış üç adımda işliyor: önce ruh halini anlıyoruz, sonra sana özel bir prompt oluşturuyoruz,
            en sonunda da sana film/dizi rafı sunuyoruz. Kısa ve net kalmaya çalışıyoruz.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODELS.map((model) => (
            <ModelCard key={model.slug} {...model} />
          ))}
        </div>

        <QuickChat />
      </div>
    </AppShell>
  );
}
