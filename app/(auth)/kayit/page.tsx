'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function KayitPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function validate(): string | null {
    if (!EMAIL_RE.test(email)) return 'Geçerli bir e-posta adresi gir.';
    if (password.length < 8) return 'Şifre en az 8 karakter olmalı.';
    if (password !== passwordAgain) return 'Şifreler eşleşmiyor.';
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Doğrulama mailindeki link buraya döner; aynı callback OAuth
        // ile paylaşılıyor çünkü ikisi de kod değişimiyle sonuçlanıyor.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(
        signUpError.message === 'User already registered'
          ? 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.'
          : signUpError.message
      );
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
          <Logo size="md" pulsing className="mb-10" />
          <h1 className="font-display text-2xl text-ivory mb-4">E-postanı kontrol et</h1>
          <p className="text-[15px] text-dust leading-relaxed max-w-[300px]">
            <span className="text-ivory">{email}</span> adresine bir doğrulama linki
            gönderdik. Hesabını aktifleştirmek için linke tıkla.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-fade-up">
        <Logo size="md" className="mb-10" />

        <h1 className="font-display text-3xl text-ivory mb-3">Hesap oluştur</h1>
        <p className="text-[15px] text-dust leading-relaxed mb-8 max-w-[300px]">
          E-posta ve şifreyle kayıt ol. Devam etmeden önce e-postanı doğrulaman gerekecek.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Input
            type="email"
            autoComplete="email"
            placeholder="e-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="şifre (en az 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="şifre tekrar"
            value={passwordAgain}
            onChange={(e) => setPasswordAgain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className="mt-3 text-[13px] text-rust text-left w-full">{error}</p>}

        <Button
          variant="primary"
          fullWidth
          className="mt-6"
          onClick={handleSubmit}
          disabled={submitting || !email || !password || !passwordAgain}
        >
          {submitting ? 'Gönderiliyor…' : 'Kayıt ol'}
        </Button>

        <p className="mt-8 text-[13px] text-dust">
          Zaten hesabın var mı?{' '}
          <Link href="/giris" className="text-gold hover:text-gold-soft transition-colors">
            Giriş yap
          </Link>
        </p>
        <Link href="/login" className="mt-3 text-[13px] text-fog hover:text-dust transition-colors">
          ← Google/Apple ile devam et
        </Link>
      </div>
    </main>
  );
}
