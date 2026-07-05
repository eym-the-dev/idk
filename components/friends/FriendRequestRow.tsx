'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function FriendRequestRow({
  friendshipId,
  username,
}: {
  friendshipId: string;
  username: string;
  avatarUrl?: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function respond(status: 'accepted' | 'blocked') {
    setBusy(true);
    await (supabase.from('friendships') as any).update({ status }).eq('id', friendshipId);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3">
      <span className="font-mono text-[14px] text-ivory">@{username}</span>
      <div className="flex gap-4">
        <button
          disabled={busy}
          onClick={() => respond('accepted')}
          className="text-[13px] font-medium text-gold hover:text-gold-soft transition-colors disabled:opacity-40"
        >
          Kabul et
        </button>
        <button
          disabled={busy}
          onClick={() => respond('blocked')}
          className="text-[13px] font-medium text-dust hover:text-ivory transition-colors disabled:opacity-40"
        >
          Reddet
        </button>
      </div>
    </div>
  );
}
