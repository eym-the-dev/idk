import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { UserSearch } from '@/components/friends/UserSearch';
import { FriendRequestRow } from '@/components/friends/FriendRequestRow';
import { FriendRow } from '@/components/friends/FriendRow';

export default async function FriendsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('users').select('username').eq('id', user.id).single();
  const typedMe = me as { username: string | null } | null;

  // Bana gelen bekleyen istekler
  const { data: incoming } = await supabase
    .from('friendships')
    .select('id, requester_id, users:requester_id(username, avatar_url)')
    .eq('addressee_id', user.id)
    .eq('status', 'pending');

  // Kabul edilmiş arkadaşlıklar — ben ister isteyen ister alan taraf olayım
  const { data: accepted } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, users_a:requester_id(username, avatar_url), users_b:addressee_id(username, avatar_url)')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');

  return (
    <AppShell username={typedMe?.username ?? undefined}>
      <div className="px-6 py-10 md:px-12 md:py-14 max-w-lg mx-auto md:mx-0">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          arkadaşlar
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">Kullanıcı ara</h1>

        <UserSearch currentUserId={user.id} />

        {incoming && incoming.length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-[11px] uppercase tracking-wide text-dust mb-4">
              bekleyen istekler
            </h2>
            <div className="flex flex-col gap-2.5">
              {incoming.map((req: any) => (
                <FriendRequestRow
                  key={req.id}
                  friendshipId={req.id}
                  username={req.users?.username ?? '?'}
                  avatarUrl={req.users?.avatar_url}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-dust mb-4">
            arkadaşların
          </h2>
          {!accepted || accepted.length === 0 ? (
            <p className="text-[14px] text-fog">
              Henüz kimse yok — yukarıdan bir kullanıcı adı ara ve istek gönder.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {accepted.map((f: any) => {
                const isMeRequester = f.requester_id === user.id;
                const other = isMeRequester ? f.users_b : f.users_a;
                const otherId = isMeRequester ? f.addressee_id : f.requester_id;
                return (
                  <FriendRow
                    key={f.id}
                    friendId={otherId}
                    username={other?.username ?? '?'}
                    avatarUrl={other?.avatar_url}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

