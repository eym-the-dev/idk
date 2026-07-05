'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { scoreOnboardingAnswers } from '@/lib/profile/scoringEngine';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

type Question = {
  id: string;
  text: string;
  options: string[];
  field: 'current_mood' | 'disliked_genres' | 'preferred_vibe' | 'content_length';
};

// MVP için sabit soru seti — ileride onboarding_questions tablosundan
// dinamik çekilecek şekilde genişletilebilir (bkz. proje şeması).
const QUESTIONS: Question[] = [
  {
    id: 'mood',
    text: 'Şu an nasıl bir modda hissediyorsun?',
    options: ['Enerjik', 'Sakin', 'Düşünceli', 'Eğlence arıyorum'],
    field: 'current_mood',
  },
  {
    id: 'avoid',
    text: 'Kesinlikle görmek istemediğin bir tür var mı?',
    options: ['Dram', 'Korku', 'Politik içerik', 'Yok, hepsi olur'],
    field: 'disliked_genres',
  },
  {
    id: 'vibe',
    text: 'Aradığın vibe ne?',
    options: ['Motive edici', 'Rahatlatıcı', 'Zihin açıcı', 'Sadece keyifli'],
    field: 'preferred_vibe',
  },
  {
    id: 'length',
    text: 'İçerik uzunluğu tercihin?',
    options: ['Kısa (<15dk)', 'Orta', 'Uzun', 'Fark etmez'],
    field: 'content_length',
  },
];

export default function ProfilTamamlaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(-1); // -1 = giriş mesajı ekranı
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const current = QUESTIONS[step];

  async function selectAnswer(option: string) {
    const next = { ...answers, [current.field]: option };
    setAnswers(next);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await finish(next);
    }
  }

  async function finish(finalAnswers: Record<string, string>) {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_profiles')
      .select('taste_vector')
      .eq('user_id', user.id)
      .single();

    const existingProfile = existing as { taste_vector: Record<string, number> | null } | null;
    const nextVector = scoreOnboardingAnswers(
      existingProfile?.taste_vector ?? {},
      finalAnswers
    );

    await (supabase.from('user_profiles') as any)
      .update({
        current_mood: finalAnswers.current_mood,
        preferred_vibe: finalAnswers.preferred_vibe,
        disliked_genres: finalAnswers.disliked_genres
          ? [finalAnswers.disliked_genres]
          : [],
        taste_vector: nextVector,
        onboarding_completed: true,
      })
      .eq('user_id', user.id);

    router.push('/dashboard?yeni=1');
  }

  if (step === -1) {
    return (
      <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
          <Logo size="md" pulsing className="mb-10" />
          <h1 className="font-display text-2xl text-ivory mb-4 leading-snug">
            Profilini senin için daha iyi kişiselleştirebilmem adına
            sana sadece 4-5 tane çok kısa soru soracağım.
          </h1>
          <p className="text-[15px] text-dust mb-10">Bu süreç sadece 30 saniyeni alacak.</p>
          <Button variant="primary" fullWidth onClick={() => setStep(0)}>
            Başlayalım
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex gap-1.5 mb-10">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`h-[3px] flex-1 rounded-full ${
                i <= step ? 'bg-gold' : 'bg-hairline'
              }`}
            />
          ))}
        </div>

        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          soru {step + 1} / {QUESTIONS.length}
        </span>
        <h2 className="font-display text-2xl text-ivory mt-3 mb-8">{current.text}</h2>

        <div className="flex flex-col gap-2.5">
          {current.options.map((option) => (
            <button
              key={option}
              disabled={saving}
              onClick={() => selectAnswer(option)}
              className="text-left rounded-lg border border-hairline bg-surface px-5 py-4 text-[15px] text-ivory transition-colors hover:border-gold hover:bg-surface-raised disabled:opacity-40"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
