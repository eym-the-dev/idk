import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SyncPlayer } from '@/components/watch-party/SyncPlayer';

export default async function WatchRoomPage({ params }: { params: { roomId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: room } = await supabase
    .from('watch_rooms')
    .select('id, host_id, content_ref, playback_state, users:host_id(username)')
    .eq('id', params.roomId)
    .single();

  if (!room) redirect('/watch-party');

  const typedRoom = room as { id: string; host_id: string; content_ref: string | null; playback_state: unknown; users: { username: string | null } | null };

  // Katılan zaten üye değilse odaya ekle.
  await (supabase.from('watch_room_members') as any).upsert(
    { room_id: typedRoom.id, user_id: user.id },
    { onConflict: 'room_id,user_id' }
  );

  const { data: members } = await supabase
    .from('watch_room_members')
    .select('user_id, users:user_id(username)')
    .eq('room_id', typedRoom.id);

  return (
    <main className="min-h-screen bg-void px-6 py-10">
      <div className="max-w-lg mx-auto">
        <Link href="/watch-party" className="text-dust text-[13px] hover:text-ivory transition-colors">
          ← odalar
        </Link>

        <h1 className="font-display text-2xl text-ivory mt-4 mb-1 truncate">
          {typedRoom.content_ref || 'İçerik belirtilmedi'}
        </h1>
        <p className="font-mono text-[12px] text-dust mb-8">
          host: @{(typedRoom.users as any)?.username}
        </p>

        <SyncPlayer
          roomId={typedRoom.id}
          isHost={typedRoom.host_id === user.id}
          contentRef={typedRoom.content_ref}
          initialState={(typedRoom.playback_state as { position: number; is_playing: boolean }) ?? {
            position: 0,
            is_playing: false,
          }}
        />

        <h2 className="font-mono text-[11px] uppercase tracking-wide text-dust mb-3 mt-10">
          odada ({members?.length ?? 0})
        </h2>
        <div className="flex flex-wrap gap-2">
          {members?.map((m: any) => (
            <span
              key={m.user_id}
              className="rounded-full border border-hairline px-3.5 py-1.5 text-[13px] text-ivory font-mono"
            >
              @{m.users?.username ?? '?'}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
