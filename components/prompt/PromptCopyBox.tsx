'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type Props = {
  promptText: string;
  aiModelSlug: string;
};

export function PromptCopyBox({ promptText, aiModelSlug }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDiscover() {
    setDiscovering(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalitySummary: promptText,
          aiModelSlug,
        }),
      });

      const data = await res.json().catch(() => null);
      setDiscovering(false);

      if (!res.ok) {
        setError(data?.error || 'Gemini şu an öneri çıkaramadı.');
        return;
      }

      router.push(data?.onboardingCompleted ? '/dashboard?yeni=1' : '/profil-tamamla');
    } catch {
      setDiscovering(false);
      setError('Bağlantı hatası oldu. Tekrar dene.');
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5 md:p-6">
      <div className="mb-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
          izleme özeti
        </p>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-dust">
          Bu metin senin izleme kişiliğini özetliyor. Kopyalayabilirsin ama asıl akış
          aşağıda: Gemini bunu okuyup sana direkt izleme listesi çıkaracak.
        </p>
      </div>

      <pre className="whitespace-pre-wrap font-sans text-[14px] text-ivory leading-relaxed max-h-80 overflow-y-auto rounded-xl border border-hairline bg-void/60 p-4">
        {promptText}
      </pre>

      <div className="mt-5 flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center">
        <Button variant="primary" onClick={handleDiscover} disabled={discovering}>
          {discovering ? 'Gemini keşfi hazırlanıyor…' : 'Gemini ile keşfet'}
        </Button>
        <Button variant="secondary" onClick={handleCopy} disabled={discovering}>
          {copied ? 'Özet kopyalandı' : 'Özeti kopyala'}
        </Button>
      </div>

      {error && <p className="mt-4 text-[13px] text-rust">{error}</p>}
    </div>
  );
}
