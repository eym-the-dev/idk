'use client';

import { useMemo, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PromptCopyBox } from '@/components/prompt/PromptCopyBox';
import {
  AI_OPTIONS,
  PROMPT_QUIZ,
  getAiOptionBySlug,
  isPromptQuizComplete,
  recommendAiModels,
  type AiOptionSlug,
  type PromptQuizAnswers,
  type PromptQuizQuestionId,
} from '@/lib/prompt-engine/promptWizard';

export default function CustomAiPage() {
  const [answers, setAnswers] = useState<PromptQuizAnswers>({});
  const [selectedAiSlug, setSelectedAiSlug] = useState<AiOptionSlug | null>(null);
  const [aiName, setAiName] = useState('');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'prompt' | 'paste'>('prompt');

  const isQuizComplete = isPromptQuizComplete(answers);
  const recommendedAiList = useMemo(
    () => (isQuizComplete ? recommendAiModels(answers) : []),
    [answers, isQuizComplete]
  );

  const selectionCards = useMemo(() => {
    if (!isQuizComplete) return [];

    const customOption = AI_OPTIONS.find((option) => option.slug === 'custom');
    return customOption ? [...recommendedAiList, customOption] : recommendedAiList;
  }, [isQuizComplete, recommendedAiList]);

  const selectedAi = selectedAiSlug ? getAiOptionBySlug(selectedAiSlug) : null;
  const answeredCount = Object.keys(answers).length;
  const canGenerate =
    isQuizComplete && !!selectedAiSlug && (selectedAiSlug !== 'custom' || !!aiName.trim());

  function selectAnswer(questionId: PromptQuizQuestionId, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setSelectedAiSlug(null);
    setPrompt(null);
    setError(null);
  }

  function selectAi(slug: AiOptionSlug) {
    setSelectedAiSlug(slug);
    setPrompt(null);
    setError(null);
  }

  async function generate() {
    if (!canGenerate || !selectedAiSlug || !isQuizComplete) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-dynamic-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedAiSlug,
          customAiName: selectedAiSlug === 'custom' ? aiName.trim() : undefined,
          answers,
        }),
      });

      const data = await res.json().catch(() => null);
      setLoading(false);

      if (!res.ok) {
        setError(data?.error || 'Prompt üretilemedi, tekrar dene.');
        return;
      }

      setPrompt(data?.prompt ?? null);
      if (!data?.prompt) {
        setError('Prompt üretilemedi, tekrar dene.');
      }
    } catch {
      setLoading(false);
      setError('Bağlantı sırasında bir hata oluştu. Tekrar dene.');
    }
  }

  return (
    <main className="min-h-screen bg-void px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-14">
          <Logo size="sm" />
        </header>

        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          kişilik analizi
        </span>
        <h1 className="font-display text-3xl text-ivory mt-3 mb-2">
          Önce ruh halini anla, sonra sana özel prompt üret
        </h1>
        <p className="text-[15px] text-dust mb-8 max-w-2xl">
          Bu akış basitçe çalışıyor: önce ruh halini 4 kısa soruyla anlıyorum, sonra sana bir izleme kişiliği özeti çıkarıyorum.
          Sonra bu metni bir prompt gibi kullanıp sana 8 film/dizi önerisi ve bir izlenecekler rafı hazırlıyorum.
          Böylece hem hızlı hem de daha anlamlı bir keşif yaşarsın.
        </p>

        {!prompt && (
          <div className="space-y-8">
            <section className="rounded-2xl border border-hairline bg-surface p-5 md:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dust">
                    adım 01
                  </p>
                  <h2 className="mt-2 text-xl text-ivory font-display">Ruh halini 4 soru ile anla</h2>
                </div>
                <div className="min-w-[112px] text-right">
                  <p className="text-[13px] text-dust">{answeredCount}/4 tamamlandı</p>
                  <div className="mt-2 h-1.5 rounded-full bg-void">
                    <div
                      className="h-1.5 rounded-full bg-gold transition-all duration-300"
                      style={{ width: `${(answeredCount / PROMPT_QUIZ.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {PROMPT_QUIZ.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-hairline bg-void/40 p-4"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dust">
                      soru 0{index + 1}
                    </p>
                    <h3 className="mt-2 text-[17px] leading-snug text-ivory">{question.title}</h3>

                    <div className="mt-4 grid gap-2">
                      {question.options.map((option) => {
                        const active = answers[question.id] === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => selectAnswer(question.id, option.id)}
                            className={`rounded-xl border px-4 py-3 text-left transition-all ${
                              active
                                ? 'border-gold bg-gold/10 text-ivory'
                                : 'border-hairline bg-surface text-dust hover:border-gold/40 hover:text-ivory'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[15px] font-medium">{option.label}</span>
                              {active && (
                                <span className="font-mono text-[11px] uppercase tracking-wide text-gold">
                                  seçildi
                                </span>
                              )}
                            </div>
                            <p className={`mt-1 text-[13px] ${active ? 'text-ivory/80' : 'text-dust'}`}>
                              {option.hint}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {isQuizComplete && (
              <section className="rounded-2xl border border-hairline bg-surface p-5 md:p-6">
                <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dust">
                      adım 02
                    </p>
                    <h2 className="mt-2 text-xl text-ivory font-display">AI seçimini yap</h2>
                    <p className="mt-2 max-w-2xl text-[14px] text-dust">
                      Cevaplarına göre en uyumlu seçenekleri yukarı taşıdım. İstersen önerilen
                      modeli seç, istersen kendi kullandığın modeli elle yaz.
                    </p>
                  </div>
                  {recommendedAiList[0] && (
                    <div className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-[12px] text-gold">
                      Önerilen: {recommendedAiList[0].name}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {selectionCards.map((option, index) => {
                    const active = selectedAiSlug === option.slug;
                    const recommendation = recommendedAiList.find((item) => item.slug === option.slug);

                    return (
                      <button
                        key={option.slug}
                        type="button"
                        onClick={() => selectAi(option.slug)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          active
                            ? 'border-gold bg-gold/10'
                            : 'border-hairline bg-void/40 hover:border-gold/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-display text-ivory">{option.name}</p>
                            <p className="mt-1 text-[12px] uppercase tracking-wide text-dust">
                              {index === 0 && option.slug !== 'custom' ? 'en iyi eşleşme' : option.badge}
                            </p>
                          </div>
                          {active && (
                            <span className="font-mono text-[11px] uppercase tracking-wide text-gold">
                              aktif
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-[14px] leading-relaxed text-dust">{option.tagline}</p>

                        <p className="mt-4 text-[13px] text-ivory">
                          {recommendation?.reason ?? 'Kullandığın modeli elle yazarak bu akışa dahil edebilirsin.'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedAiSlug === 'custom' && (
                  <div className="mt-5 max-w-xl">
                    <Input
                      value={aiName}
                      onChange={(e) => {
                        setAiName(e.target.value);
                        setPrompt(null);
                        setError(null);
                      }}
                      placeholder="örn. Perplexity, DeepSeek, Grok..."
                      onKeyDown={(e) => e.key === 'Enter' && generate()}
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center">
                  <Button variant="primary" onClick={generate} disabled={loading || !canGenerate}>
                    {loading ? 'Özet işleniyor…' : 'İzleme özetini oluştur'}
                  </Button>
                  <p className="text-[13px] text-dust">
                    Seçimlerin aynı kalırsa sonuç cache&apos;den gelir; gereksiz tekrar üretim yapılmaz.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}

        {error && <p className="text-[13px] text-rust mt-3">{error}</p>}

        {prompt && (
          <div className="mt-2 rounded-2xl border border-hairline bg-surface p-5 md:p-6">
            <div className="mb-5 border-b border-hairline pb-5">
              <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
                adım 03
              </span>
              <h2 className="mt-3 text-2xl font-display text-ivory">
                Prompt hazır
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] text-dust">
                Aşağıdaki metni kopyalayıp Gemini&apos;ye yapıştırabilirsin. Gemini bu metni kullanarak
                ruh halini analiz edecek, sana 8 film/dizi önerisi ve izlenecekler listesi çıkaracak.
              </p>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAnalysisMode('prompt')}
                className={`rounded-full border px-3 py-1.5 text-[12px] ${analysisMode === 'prompt' ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-dust'}`}
              >
                Promptu kullan
              </button>
              <button
                type="button"
                onClick={() => setAnalysisMode('paste')}
                className={`rounded-full border px-3 py-1.5 text-[12px] ${analysisMode === 'paste' ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-dust'}`}
              >
                Kendi cevabını yapıştır
              </button>
            </div>

            {analysisMode === 'prompt' ? (
              <PromptCopyBox
                promptText={prompt}
                aiModelSlug={
                  selectedAiSlug && selectedAiSlug !== 'custom' ? selectedAiSlug : 'custom'
                }
              />
            ) : (
              <div className="space-y-3">
                <textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  rows={8}
                  placeholder="Örneğin: Bugün kendimi biraz yorgun hissediyorum, daha çok sakin ve düşündürücü şeyler izlemek istiyorum..."
                  className="w-full rounded-xl border border-hairline bg-void/60 p-4 text-[14px] text-ivory outline-none focus:border-gold"
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!analysisText.trim()) {
                      setError('Önce bir cevap metni yapıştırmalısın.');
                      return;
                    }
                    setPrompt(`${prompt}\n\nKullanıcının kendi cevabı:\n${analysisText.trim()}`);
                  }}
                >
                  Metni prompta ekle
                </Button>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setPrompt(null);
                  setError(null);
                  setAnalysisText('');
                  setAnalysisMode('prompt');
                }}
              >
                Seçimleri düzenle
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
