'use client';

import { useEffect, useRef, useState } from 'react';
import { secretSequenceEgg } from '@/lib/easter-eggs/registry';

/**
 * Sayfanın hiçbir yerinde görünmeyen, tamamen sessiz bir dinleyici.
 * Doğru tuş dizisi girilirse ve nadir şans tutarsa, ekranın ortasında
 * birkaç saniyeliğine soluk bir cümle belirir, sonra kaybolur — tıklama,
 * buton, bildirim yok. Fark eden fark eder.
 */
export function SecretKeyListener() {
  const [message, setMessage] = useState<string | null>(null);
  const bufferRef = useRef<string[]>([]);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const seq = secretSequenceEgg.sequence;
      bufferRef.current = [...bufferRef.current, e.key].slice(-seq.length);

      const matches = seq.every((step, i) => bufferRef.current[i] === step);
      if (!matches) return;

      bufferRef.current = [];
      if (Math.random() > secretSequenceEgg.rarity) return;

      const pool = secretSequenceEgg.messages;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setMessage(chosen);

      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setMessage(null), 4200);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none px-8"
      aria-hidden="true"
    >
      <p className="font-display italic text-xl text-ivory/70 text-center animate-fade-up">
        {message}
      </p>
    </div>
  );
}
