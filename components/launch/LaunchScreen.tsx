'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

export function LaunchScreen({ username }: { username?: string | null }) {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'loading' | 'welcome'>('intro');

  useEffect(() => {
    const introTimer = window.setTimeout(() => setPhase('loading'), 600);
    const welcomeTimer = window.setTimeout(() => setPhase('welcome'), 2200);
    const navTimer = window.setTimeout(() => router.replace('/dashboard'), 3600);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[1000] flex min-h-screen items-center justify-center overflow-hidden bg-void px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,161,91,0.16),transparent_45%)]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        <div className={`transition-all duration-700 ${phase === 'intro' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
          <Logo size="xl" className="tracking-[0.25em]" />
        </div>

        <div className={`mt-8 flex items-center gap-3 transition-all duration-700 ${phase === 'loading' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-2.5 w-2.5 animate-spin rounded-full border border-gold border-t-transparent" />
          <div className="h-2.5 w-2.5 animate-spin rounded-full border border-gold/70 border-t-transparent [animation-delay:120ms]" />
          <div className="h-2.5 w-2.5 animate-spin rounded-full border border-gold/40 border-t-transparent [animation-delay:240ms]" />
        </div>

        <div className={`mt-10 max-w-xl transition-all duration-700 ${phase === 'welcome' ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">hoşgeldin</p>
          <h1 className="mt-3 font-display text-3xl text-ivory sm:text-5xl">
            {username ? `Hoşgeldin ${username}` : 'Hoşgeldin'}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-dust">
            Ruh haline uygun film, dizi ve izlemelik içeriklerle seni bekliyoruz.
          </p>
        </div>
      </div>
    </div>
  );
}
