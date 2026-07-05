'use client';

import { useEffect, useState } from 'react';

export function AdminEggPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState('');
  const [status, setStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const res = await fetch('/api/easter-eggs');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(true);
        setMessages(data.messages?.join('\n') ?? '');
      }
    }
    checkAccess();
  }, []);

  async function saveMessages() {
    const res = await fetch('/api/easter-eggs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.split('\n').filter(Boolean) }),
    });
    const data = await res.json();
    setStatus(res.ok ? 'Easter egg mesajları güncellendi.' : data?.error || 'İzin yok.');
  }

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[9998] w-[280px] rounded-2xl border border-gold/20 bg-surface/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">admin easter egg</p>
        <button onClick={() => setOpen((v) => !v)} className="text-[12px] text-dust">{open ? 'kapat' : 'aç'}</button>
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          <textarea
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-hairline bg-void px-3 py-2 text-[13px] text-ivory outline-none"
            placeholder="Her satır bir mesaj"
          />
          <button onClick={saveMessages} className="w-full rounded-full bg-gold px-3 py-2 text-[13px] font-medium text-void">
            Kaydet
          </button>
          {status ? <p className="text-[12px] text-dust">{status}</p> : null}
        </div>
      )}
    </div>
  );
}
