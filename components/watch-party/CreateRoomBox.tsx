'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CreateRoomBox() {
  const supabase = createClient();
  const router = useRouter();
  const [contentRef, setContentRef] = useState('');
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    if (!contentRef.trim()) return;
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: room, error } = await (supabase.from('watch_rooms') as any)
      .insert({ host_id: user.id, content_ref: contentRef.trim() })
      .select('id')
      .single();

    if (error || !room) {
      setCreating(false);
      return;
    }

    await (supabase.from('watch_room_members') as any).insert({ room_id: room.id, user_id: user.id });
    router.push(`/watch-party/${room.id}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        value={contentRef}
        onChange={(e) => setContentRef(e.target.value)}
        placeholder="İzlenecek film/dizinin linki veya adı"
        onKeyDown={(e) => e.key === 'Enter' && createRoom()}
      />
      <Button variant="primary" onClick={createRoom} disabled={creating || !contentRef.trim()}>
        {creating ? 'Açılıyor…' : 'Oda aç'}
      </Button>
    </div>
  );
}
