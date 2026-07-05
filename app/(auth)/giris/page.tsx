'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function GirisPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email || !password) return;
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (signInError) {
      setError(
        signInError.message === 'Email not confirmed'
          ? 'E-postanı henüz doğrulamadın — gelen kutunu kontrol et.'
          : signInError.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı.'
          : signInError.message
      );
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <Logo size="md" className="mb-10" />

        <h1 className="font-display text-3xl text-ivory mb-3">E-posta ile giriş yap</h1>

        <div className="w-full flex flex-col gap-3 mt-4">
          <Input
            type="email"
            autoComplete="email"
            placeholder="e-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className="mt-3 text-[13px] text-rust text-left w-full">{error}</p>}

        <Button
          variant="primary"
          fullWidth
          className="mt-6"
          onClick={handleSubmit}
          disabled={submitting || !email || !password}
        >
          {submitting ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </Button>

        <p className="mt-8 text-[13px] text-dust">
          Hesabın yok mu?{' '}
          <Link href="/kayit" className="text-gold hover:text-gold-soft transition-colors">
            Kayıt ol
          </Link>
        </p>
        <Link href="/login" className="mt-3 text-[13px] text-fog hover:text-dust transition-colors">
          ← Google/Apple ile devam et
        </Link>
      </div>
    </main>
  );
}
