import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/AppShell';
import { DeleteAccountBox } from '@/components/account/DeleteAccountBox';

const PREFS = [
  { label: 'Ruh hali', value: 'sakin ve düşündürücü' },
  { label: 'Tercih', value: 'dizi + film dengesi' },
  { label: 'Keşif modu', value: 'hafif ve karakter odaklı' },
];

const QUICK_ACTIONS = [
  'Haftalık keşif',
  'Birlikte izleme odası',
  'YouTube izlemelik video önerileri',
  'Kişisel öneri akışı',
];

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  email: 'E-posta / Şifre',
};

export default async function HesapPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('username, provider, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  const typedProfile = profile as {
    username: string | null;
    provider: string | null;
    avatar_url: string | null;
    created_at: string | null;
  } | null;

  const rows = [
    { label: 'Kullanıcı adı', value: typedProfile?.username ? `@${typedProfile.username}` : '—' },
    { label: 'E-posta', value: user.email ?? '—' },
    {
      label: 'Giriş yöntemi',
      value: typedProfile?.provider ? PROVIDER_LABELS[typedProfile.provider] ?? typedProfile.provider : '—',
    },
    {
      label: 'Üyelik tarihi',
      value: typedProfile?.created_at
        ? new Date(typedProfile.created_at).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '—',
    },
  ];

  return (
    <AppShell username={typedProfile?.username ?? undefined}>
      <div className="px-6 py-10 md:px-12 md:py-14 max-w-lg mx-auto md:mx-0">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          hesap
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-3 mb-8">
          Hesap bilgileri
        </h1>

        <div className="rounded-lg border border-hairline bg-surface divide-y divide-hairline">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-4">
              <span className="text-[13px] text-dust">{row.label}</span>
              <span className="text-[14px] text-ivory font-mono">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-hairline bg-void/40 p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
            kişisel tercihler
          </h2>
          <div className="mt-4 grid gap-3">
            {PREFS.map((pref) => (
              <div key={pref.label} className="flex items-center justify-between rounded-xl border border-hairline bg-surface/80 px-3 py-3">
                <span className="text-[13px] text-dust">{pref.label}</span>
                <span className="text-[13px] text-ivory">{pref.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <span key={action} className="rounded-full border border-hairline px-3 py-1.5 text-[12px] text-dust">
                {action}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-wide text-rust mb-4">
            tehlikeli bölge
          </h2>
          <DeleteAccountBox username={typedProfile?.username ?? ''} />
        </div>
      </div>
    </AppShell>
  );
}
