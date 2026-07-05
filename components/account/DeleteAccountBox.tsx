'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function DeleteAccountBox({ username }: { username: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toLowerCase() === username.toLowerCase();

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);

    const res = await fetch('/api/account/delete', { method: 'POST' });

    if (!res.ok) {
      setDeleting(false);
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? 'Hesap silinemedi, tekrar dene.');
      return;
    }

    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!expanded) {
    return (
      <div className="rounded-lg border border-rust/40 bg-surface p-5">
        <p className="text-[14px] text-ivory mb-1">Hesabını sil</p>
        <p className="text-[13px] text-dust mb-4">
          Bu işlem geri alınamaz. Profilin, önerilerin, arkadaşlıkların, mesajların ve
          beraber izleme geçmişin kalıcı olarak silinir.
        </p>
        <Button variant="secondary" onClick={() => setExpanded(true)}>
          Hesabımı silmek istiyorum
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-rust bg-surface p-5">
      <p className="text-[14px] text-ivory mb-1">Emin misin?</p>
      <p className="text-[13px] text-dust mb-4">
        Onaylamak için kullanıcı adını (
        <span className="text-ivory font-mono">@{username}</span>) aşağıya yaz.
      </p>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={username}
        autoComplete="off"
      />
      {error && <p className="mt-2 text-[13px] text-rust">{error}</p>}
      <div className="flex gap-2.5 mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            setExpanded(false);
            setConfirmText('');
            setError(null);
          }}
          disabled={deleting}
        >
          Vazgeç
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!canDelete || deleting}
          className="!border-rust text-rust hover:!bg-rust hover:!text-ivory"
        >
          {deleting ? 'Siliniyor…' : 'Evet, kalıcı olarak sil'}
        </Button>
      </div>
    </div>
  );
}
