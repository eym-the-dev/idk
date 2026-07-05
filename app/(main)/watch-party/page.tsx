import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { CreateRoomBox } from '@/components/watch-party/CreateRoomBox';
import Link from 'next/link';

export default async function WatchPartyListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('users').select('username').eq('id', user.id).single();
  const typedMe = me as { username: string | null } | null;

  const { data: rooms } = await supabase
    .from('watch_rooms')
    .select('id, content_ref, host_id, users:host_id(username), watch_room_members(user_id)')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <AppShell username={typedMe?.username ?? undefined}>
      <div className="px-6 py-10 md:px-12 md:py-14 max-w-lg mx-auto md:mx-0">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          sosyal
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">
          Beraber İzle
        </h1>

        <CreateRoomBox />

        <h2 className="font-mono text-[11px] uppercase tracking-wide text-dust mb-4 mt-12">
          aktif odalar
        </h2>

        {!rooms?.length && (
          <p className="text-[14px] text-fog">Henüz açık bir oda yok — ilkini sen aç.</p>
        )}

        <div className="flex flex-col gap-2">
          {rooms?.map((room: any) => (
            <Link
              key={room.id}
              href={`/watch-party/${room.id}`}
              className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3.5 hover:border-gold hover:bg-surface-raised transition-colors"
            >
              <div>
                <p className="text-[14px] text-ivory truncate max-w-[220px]">
                  {room.content_ref || 'İçerik belirtilmedi'}
                </p>
                <p className="font-mono text-[12px] text-dust mt-0.5">
                  @{room.users?.username} · {room.watch_room_members?.length ?? 0} kişi
                </p>
              </div>
              <span className="text-dust text-[13px]">Katıl →</span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
