import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { FriendRow } from '@/components/friends/FriendRow';

export default async function FriendProfilePage({
  params,
}: {
  params: { friendId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: me } = await supabase.from('users').select('username').eq('id', user.id).single();
  const typedMe = me as { username: string | null } | null;

  const { data: friend } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', params.friendId)
    .single();

  if (!friend) redirect('/friends');

  const typedFriend = friend as { id: string; username: string } | null;
  if (!typedFriend) redirect('/friends');

  const { data: myProfile } = await supabase
    .from('user_profiles')
    .select('taste_vector')
    .eq('user_id', user.id)
    .single();

  const { data: theirProfile } = await supabase
    .from('user_profiles')
    .select('taste_vector')
    .eq('user_id', typedFriend.id)
    .single();

  const typedMyProfile = myProfile as { taste_vector: Record<string, number> | null } | null;
  const typedTheirProfile = theirProfile as { taste_vector: Record<string, number> | null } | null;

  const overlap = sharedTasteKeys(
    typedMyProfile?.taste_vector ?? {},
    typedTheirProfile?.taste_vector ?? {}
  );

  return (
    <AppShell username={typedMe?.username ?? undefined}>
      <div className="px-6 py-10 md:px-12 md:py-14 max-w-lg mx-auto md:mx-0">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          profil
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-6">
          @{typedFriend.username}
        </h1>

        <div className="mb-8">
          <FriendRow friendId={typedFriend.id} username={typedFriend.username} />
        </div>

        <h2 className="font-mono text-[11px] uppercase tracking-wide text-dust mb-4">
          ortak zevkler
        </h2>
        {overlap.length === 0 ? (
          <p className="text-[14px] text-fog">
            Henüz görünür bir ortak zevk yok — ikiniz de birkaç öneri geçmişinde
            oldukça bu netleşecek.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {overlap.map((label) => (
              <span
                key={label}
                className="rounded-full border border-gold px-3.5 py-1.5 text-[13px] text-gold"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// İki taste_vector'de aynı anahtarın pozitif ağırlıkta bulunduğu, yani
// gerçekten "paylaşılan" sayılabilecek etiketleri döndürür.
function sharedTasteKeys(a: Record<string, number>, b: Record<string, number>) {
  const LABELS: Record<string, string> = {
    'mood:energetic': 'Enerjik',
    'mood:calm': 'Sakin',
    'mood:reflective': 'Düşünceli',
    'mood:fun_seeking': 'Eğlence arıyor',
    'vibe:motivational': 'Motive edici',
    'vibe:relaxing': 'Rahatlatıcı',
    'vibe:mind_opening': 'Zihin açıcı',
    'vibe:light_fun': 'Sadece keyifli',
  };

  return Object.keys(a)
    .filter((key) => (a[key] ?? 0) > 0 && (b[key] ?? 0) > 0)
    .map((key) => LABELS[key] ?? key);
}
