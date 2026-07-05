'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  async function handleOAuth(provider: 'google' | 'apple') {
    setLoadingProvider(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoadingProvider(null);
      // Sessiz başarısızlık yok — kullanıcıya ne olduğunu göster.
      alert('Giriş başlatılamadı. Bağlantını kontrol edip tekrar dene.');
    }
  }

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold mb-8">
          kişisel öneri motoru
        </span>

        <Logo size="xl" className="mb-6" />

        <p className="font-display text-lg text-dust leading-relaxed mb-12 max-w-[280px]">
          Ne izleyeceğini sen bilmiyorsun.
          <br />
          <span className="text-ivory">Biz biliyoruz.</span>
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => handleOAuth('google')}
            disabled={loadingProvider !== null}
          >
            <GoogleMark />
            {loadingProvider === 'google' ? 'Bağlanıyor…' : 'Google ile başla'}
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleOAuth('apple')}
            disabled={loadingProvider !== null}
          >
            <AppleMark />
            {loadingProvider === 'apple' ? 'Bağlanıyor…' : 'Apple ile başla'}
          </Button>
        </div>

        <p className="mt-10 text-[12px] text-fog leading-relaxed max-w-[260px]">
          Devam ederek Kullanım Şartları ve Gizlilik Politikası'nı kabul etmiş olursun.
        </p>

        <div className="flex items-center gap-3 w-full mt-10">
          <span className="flex-1 h-px bg-hairline" />
          <span className="font-mono text-[11px] uppercase text-fog">veya</span>
          <span className="flex-1 h-px bg-hairline" />
        </div>

        <p className="mt-6 text-[14px] text-dust">
          <Link href="/giris" className="text-gold hover:text-gold-soft transition-colors">
            E-posta ile giriş yap
          </Link>
          {' · '}
          <Link href="/kayit" className="text-gold hover:text-gold-soft transition-colors">
            Hesap oluştur
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"
      />
      <path
        fill="currentColor"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="currentColor"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="currentColor"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
      <path d="M13.05 9.55c-.02-1.9 1.55-2.82 1.62-2.87-.88-1.3-2.26-1.47-2.75-1.49-1.17-.12-2.29.69-2.88.69-.6 0-1.51-.68-2.48-.66-1.27.02-2.45.75-3.11 1.9-1.32 2.3-.34 5.7.96 7.57.63.9 1.38 1.92 2.36 1.88.95-.04 1.31-.61 2.45-.61 1.14 0 1.46.61 2.46.59 1.02-.02 1.66-.92 2.28-1.83.7-1.05 1-2.06 1.02-2.11-.02-.01-1.9-.73-1.93-2.06zM11.2 3.36c.52-.63.87-1.5.77-2.36-.75.03-1.65.5-2.19 1.12-.48.55-.9 1.44-.79 2.28.83.06 1.68-.42 2.21-1.04z" />
    </svg>
  );
}
