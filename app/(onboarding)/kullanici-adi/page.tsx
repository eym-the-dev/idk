'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function normalize(raw: string) {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Türkçe aksan/karakterleri sadeleştir
    .replace(/[^a-z0-9_]/g, '');
}

export default function UsernamePage() {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const checkAvailability = useCallback(
    async (username: string) => {
      if (!USERNAME_RE.test(username)) {
        setStatus('invalid');
        return;
      }
      setStatus('checking');
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      setStatus(data ? 'taken' : 'available');
    },
    [supabase]
  );

  useEffect(() => {
    const clean = normalize(value);
    if (!clean) {
      setStatus('idle');
      return;
    }
    const timeout = setTimeout(() => checkAvailability(clean), 350);
    return () => clearTimeout(timeout);
  }, [value, checkAvailability]);

  async function handleSubmit() {
    const clean = normalize(value);
    if (status !== 'available') return;
    setSubmitting(true);
    setSubmitError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Session henüz client tarafında hazır değil — kullanıcıyı sonsuza
      // kadar "Kaydediliyor…" durumunda bırakmak yerine net bir mesaj göster.
      setSubmitting(false);
      setSubmitError('Oturum bulunamadı, sayfayı yenileyip tekrar dene.');
      return;
    }

    const { error, data: updated } = await (supabase.from('users') as any)
      .update({ username: clean })
      .eq('id', user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      setSubmitting(false);
      // Sadece GERÇEK bir unique constraint ihlali "alınmış" demektir.
      // (Postgres unique_violation kodu: 23505). Başka her hata (RLS,
      // ağ, geçici bağlantı sorunu vb.) kullanıcıya yanlış bilgi
      // vermemeli — asıl sebebi göster.
      if (error.code === '23505') {
        setStatus('taken');
      } else {
        setSubmitError(`Kaydedilemedi: ${error.message}`);
      }
      return;
    }

    if (!updated) {
      // Update hiçbir satırı etkilemedi — genelde RLS'in "auth.uid() = id"
      // koşulunu sağlayamaması demektir (ör. oturum senkron değil).
      setSubmitting(false);
      setSubmitError('Kaydedilemedi, oturumun senkronize olmasını bekleyip tekrar dene.');
      return;
    }

    router.push('/dashboard');
  }

  const helper: Record<Status, { text: string; tone: string }> = {
    idle: { text: 'Arkadaşların seni bu adla DM\'den bulacak.', tone: 'text-fog' },
    checking: { text: 'Kontrol ediliyor…', tone: 'text-fog' },
    available: { text: 'Uygun — bu senin.', tone: 'text-emerald' },
    taken: { text: 'Bu kullanıcı adı alınmış.', tone: 'text-rust' },
    invalid: { text: '3-20 karakter, sadece harf/rakam/_ kullanılabilir.', tone: 'text-rust' },
  };

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <Logo size="md" className="mb-10" />

        <h1 className="font-display text-3xl text-ivory mb-3">Bir kullanıcı adı seç</h1>
        <p className="text-[15px] text-dust leading-relaxed mb-8 max-w-[300px]">
          Bu, seni platformda temsil eden tek kimlik. Arkadaşların ve DM'ler bu adla sana ulaşır.
        </p>

        <div className="w-full">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dust text-[15px] pointer-events-none">
              @
            </span>
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ornekkullanici"
              maxLength={20}
              className="pl-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <p className={`mt-2 text-[13px] text-left ${helper[status].tone}`}>
            {helper[status].text}
          </p>
        </div>

        <Button
          variant="primary"
          fullWidth
          className="mt-8"
          disabled={status !== 'available' || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Kaydediliyor…' : 'Devam et'}
        </Button>

        {submitError && <p className="mt-3 text-[13px] text-rust">{submitError}</p>}
      </div>
    </main>
  );
}
