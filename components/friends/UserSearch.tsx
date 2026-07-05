'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Result = { id: string; username: string; avatar_url: string | null };

export function UserSearch({ currentUserId }: { currentUserId: string }) {
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [sentTo, setSentTo] = useState<string[]>([]);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('id, username, avatar_url')
      .ilike('username', `%${value.trim()}%`)
      .neq('id', currentUserId)
      .limit(6);

    setResults((data as Result[]) ?? []);
  }

  async function sendRequest(targetId: string) {
    await (supabase.from('friendships') as any).insert({
      requester_id: currentUserId,
      addressee_id: targetId,
      status: 'pending',
    });
    setSentTo((prev) => [...prev, targetId]);
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="@kullaniciadi"
        className="w-full rounded bg-surface border border-hairline px-4 py-3.5 text-[15px] text-ivory placeholder:text-fog outline-none focus:border-gold"
      />

      {results.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3"
            >
              <span className="font-mono text-[14px] text-ivory">@{r.username}</span>
              <button
                disabled={sentTo.includes(r.id)}
                onClick={() => sendRequest(r.id)}
                className="text-[13px] font-medium text-gold hover:text-gold-soft disabled:text-fog transition-colors"
              >
                {sentTo.includes(r.id) ? 'İstek gönderildi' : 'İstek gönder'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
