'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function FriendRow({
  friendId,
  username,
}: {
  friendId: string;
  username: string;
  avatarUrl?: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function openDm() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // dm_threads.unique(user_a, user_b) çiftinin her zaman aynı sırada
    // yazılması için uuid'leri sözlüksel olarak sıralıyoruz.
    const [userA, userB] = [user.id, friendId].sort();

    const { data: existing } = await supabase
      .from('dm_threads')
      .select('id')
      .eq('user_a', userA)
      .eq('user_b', userB)
      .maybeSingle();

    const typedExisting = existing as { id: string } | null;

    if (typedExisting) {
      router.push(`/dm/${typedExisting.id}`);
      return;
    }

    const { data: created } = await (supabase.from('dm_threads') as any)
      .insert({ user_a: userA, user_b: userB })
      .select('id')
      .single();

    const typedCreated = created as { id: string } | null;

    if (typedCreated) router.push(`/dm/${typedCreated.id}`);
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3">
      <span className="font-mono text-[14px] text-ivory">@{username}</span>
      <button
        disabled={loading}
        onClick={openDm}
        className="text-[13px] font-medium text-gold hover:text-gold-soft transition-colors disabled:opacity-40"
      >
        Mesaj gönder
      </button>
    </div>
  );
}
