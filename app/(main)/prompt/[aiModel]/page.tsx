import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStaticPrompt } from '@/lib/prompt-engine/getStaticPrompt';
import { Logo } from '@/components/ui/Logo';
import { PromptCopyBox } from '@/components/prompt/PromptCopyBox';

export default async function PromptPage({
  params,
}: {
  params: { aiModel: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // "custom" (Diğer) seçilirse dinamik akışa yönlendirilir — bu sayfa
  // sadece sabitlenmiş, popüler modeller için çalışır.
  if (params.aiModel === 'custom') redirect('/prompt/custom/olustur');

  const { modelName, prompt } = await getStaticPrompt(params.aiModel, user.id);

  return (
    <main className="min-h-screen bg-void px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-14">
          <Logo size="sm" />
        </header>

        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          adım 02
        </span>
        <h1 className="font-display text-3xl text-ivory mt-3 mb-2">
          İzleme özetin hazır
        </h1>
        <p className="text-[15px] text-dust mb-8 max-w-md">
          {modelName} lensiyle kişiliğini özetledik. Şimdi Gemini bu özeti okuyup sana
          direkt keşfet akışı çıkaracak.
        </p>

        <PromptCopyBox promptText={prompt} aiModelSlug={params.aiModel} />
      </div>
    </main>
  );
}
