import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';

export default async function DmListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('users').select('username').eq('id', user.id).single();
  const typedMe = me as { username: string | null } | null;

  const { data: threads } = await supabase
    .from('dm_threads')
    .select(
      'id, user_a, user_b, users_a:user_a(username), users_b:user_b(username), dm_messages(content, created_at)'
    )
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false });

  return (
    <AppShell username={typedMe?.username ?? undefined}>
      <div className="px-6 py-10 md:px-12 md:py-14 max-w-lg mx-auto md:mx-0">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          mesajlar
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">DM</h1>

        {!threads?.length && (
          <p className="text-[14px] text-fog">
            Henüz bir sohbetin yok. Arkadaşlar sekmesinden birine mesaj gönder.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {threads?.map((t: any) => {
            const isUserA = t.user_a === user.id;
            const other = isUserA ? t.users_b : t.users_a;
            const lastMessage = t.dm_messages?.[t.dm_messages.length - 1];
            return (
              <Link
                key={t.id}
                href={`/dm/${t.id}`}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-4 py-3.5 hover:border-gold hover:bg-surface-raised transition-colors"
              >
                <div>
                  <p className="font-mono text-[14px] text-ivory">@{other?.username ?? '?'}</p>
                  {lastMessage && (
                    <p className="text-[13px] text-dust mt-0.5 truncate max-w-[220px]">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                <span className="text-dust text-[13px]">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
