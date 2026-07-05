import { createClient } from '@/lib/supabase/server';
import { buildPersonalitySummary } from '@/lib/prompt-engine/buildPersonalitySummary';

type TasteProfile = {
  current_mood: string | null;
  preferred_vibe: string | null;
  disliked_genres: string[] | null;
  taste_vector: Record<string, number> | null;
};

/**
 * Popüler bir AI modeli (chatgpt, gemini, claude...) için kullanıcının
 * profilinden izleme kişiliği özeti üretir. Amaç öneri listesi değil;
 * Gemini'nin keşfet rafını besleyecek DNA metnidir.
 */
export async function getStaticPrompt(aiSlug: string, userId: string) {
  const supabase = createClient();

  const { data: model } = await supabase
    .from('ai_models')
    .select('id, display_name, is_dynamic')
    .eq('slug', aiSlug)
    .single();

  const typedModel = model as { id: string; display_name: string; is_dynamic: boolean } | null;

  if (!typedModel || typedModel.is_dynamic) {
    throw new Error('Bu model için sabit şablon yok — dinamik akışa yönlendirilmeli.');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('current_mood, preferred_vibe, disliked_genres, taste_vector')
    .eq('user_id', userId)
    .single<TasteProfile>();

  return {
    modelName: typedModel.display_name,
    prompt: buildPersonalitySummary(profile, aiSlug),
  };
}
