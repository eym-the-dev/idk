'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function DmThread({
  threadId,
  currentUserId,
  initialMessages,
}: {
  threadId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // dm_messages tablosundaki bu thread'e ait INSERT'leri anlık dinle.
  useEffect(() => {
    const channel = supabase
      .channel(`dm_thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    await (supabase.from('dm_messages') as any).insert({
      thread_id: threadId,
      sender_id: currentUserId,
      content,
    });
  }

  return (
    <div className="flex-1 flex flex-col max-w-lg w-full mx-auto px-6 py-6">
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2.5 text-[14px] leading-relaxed ${
                  mine
                    ? 'bg-gold text-void'
                    : 'bg-surface border border-hairline text-ivory'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3 pt-4 mt-4 border-t border-hairline">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mesaj yaz…"
          className="flex-1 rounded bg-surface border border-hairline px-4 py-3 text-[14px] text-ivory placeholder:text-fog outline-none focus:border-gold"
        />
        <button
          onClick={sendMessage}
          className="rounded border border-gold px-4 py-3 text-[14px] font-medium text-ivory hover:bg-gold hover:text-void transition-colors"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
