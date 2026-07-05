'use client';

import { useMemo, useState } from 'react';

const starterPrompts = [
  'Bana bugün için sakin bir film öner',
  'Duygusal ama hafif bir dizi öner',
  'Karanlık ama akılda kalan bir şey bul',
  'Hızlı ve eğlenceli bir şey istiyorum',
];

const fallbackReplies: Record<string, string> = {
  'Bana bugün için sakin bir film öner': 'Bugün için sakin ve düşündürücü bir seçim arıyorsan, yavaş ritimli ve duygusal yapımlar daha iyi oturur.',
  'Duygusal ama hafif bir dizi öner': 'Duygusal ama ağır olmayan bir dizi istiyorsan, karakter odaklı ve sıcak bir ton seçmek iyi olur.',
  'Karanlık ama akılda kalan bir şey bul': 'Karanlık ve hafifçe rahatsız edici bir şey arıyorsan, gizemli ve psikolojik yapılar etkili olur.',
  'Hızlı ve eğlenceli bir şey istiyorum': 'Hızlı ve keyifli bir akış istiyorsan, renkli ve hafif bir dizi ya da film daha iyi bir seçim olur.',
};

export function QuickChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content: 'Merhaba! Bugün ne tür bir film ya da dizi arıyorsun? Sana kısa ve net bir öneri vereyim.',
    },
  ]);

  const quickOptions = useMemo(() => starterPrompts, []);

  function sendMessage(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;

    setMessages((prev) => [...prev, { role: 'user', content: value }]);
    const reply = fallbackReplies[value] ?? 'Bu ruh haline uygun bir seçim için biraz daha net söyle; örn. sakin, karanlık, eğlenceli.';
    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    setInput('');
  }

  return (
    <section className="mt-8 rounded-[24px] border border-hairline bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">mini chatbot</p>
          <h3 className="mt-2 font-display text-xl text-ivory">Hızlı rehber asistanı</h3>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-hairline bg-void/50 p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`rounded-xl px-3 py-2 text-[14px] leading-relaxed ${message.role === 'assistant' ? 'bg-surface/80 text-dust' : 'bg-gold/10 text-ivory'}`}>
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => sendMessage(option)}
            className="rounded-full border border-hairline px-3 py-1.5 text-[12px] text-dust transition-colors hover:border-gold/30 hover:text-ivory"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Örn. bugün çok yorgunum, hafif bir şey isteyeyim"
          className="flex-1 rounded-full border border-hairline bg-void px-4 py-2.5 text-[14px] text-ivory outline-none ring-0 placeholder:text-dust"
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          className="rounded-full bg-gold px-4 py-2.5 text-[13px] font-medium text-void"
        >
          Gönder
        </button>
      </div>
    </section>
  );
}
