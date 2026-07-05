'use client';

import { useEffect, useState } from 'react';

const defaultMessages = [
  'Bu akışın gizli ritmi var.',
  'Küçük şeyler bazen en büyük hisleri verir.',
  'İzlemek sadece içerik değil, bir hissi yakalamaktır.',
  'Senin rafın burada yavaşça şekilleniyor.',
  'Biraz daha keşfet, biraz daha dinle.',
];

export function HiddenButtons() {
  const [visible, setVisible] = useState<string | null>(null);
  const [showing, setShowing] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (Math.random() < 0.2) {
        const message = messages[Math.floor(Math.random() * messages.length)];
        setVisible(message);
        setShowing(true);
        window.setTimeout(() => setShowing(false), 5200);
      }
    }, 10000);

    return () => window.clearInterval(timer);
  }, [messages]);

  useEffect(() => {
    async function loadMessages() {
      const res = await fetch('/api/easter-eggs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages);
        }
      }
    }
    loadMessages();
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[9998]">
        <button
          type="button"
          onClick={() => {
            const message = messages[Math.floor(Math.random() * messages.length)];
            setVisible(message);
            setShowing(true);
            window.setTimeout(() => setShowing(false), 5200);
          }}
          className="h-9 w-9 rounded-full border border-gold/30 bg-void/80 text-[11px] text-dust transition hover:border-gold/40 hover:text-gold"
        >
          ✦
        </button>
      </div>

      {visible && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-void/70 px-6 transition-all ${showing ? 'opacity-100' : 'opacity-0'}`}>
          <p className="max-w-lg rounded-2xl border border-gold/20 bg-surface px-5 py-4 text-center font-display text-lg text-ivory shadow-2xl">
            {visible}
          </p>
        </div>
      )}
    </>
  );
}
