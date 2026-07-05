'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'idk-start-guide-dismissed-v1';

export function StartGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === '1';
    setVisible(!dismissed);
  }, []);

  if (!visible) return null;

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <section className="mb-8 rounded-[28px] border border-gold/20 bg-gradient-to-br from-surface via-void/80 to-surface p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">ilk giriş rehberi</p>
          <h3 className="mt-3 font-display text-2xl text-ivory">Film ruhunu saniyeler içinde yakala</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-dust">
            Bu alan ilk seferde sana yol gösterecek. Kısa adımlarla hem ruh halini anlıyoruz hem de sana
            uygun bir film/dizi rafı hazırlıyoruz.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { icon: '🎬', title: 'Ruh halini seç', text: '4 kısa soru ile o anki modunu yakalıyoruz.' },
              { icon: '🍿', title: 'Promptu üret', text: 'Sana özel bir izleme kişiliği özeti çıkarıyoruz.' },
              { icon: '✨', title: 'Keşfet rafın açılsın', text: 'Sonra sana film ve dizi önerileri sunuyoruz.' },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-hairline bg-void/50 p-3">
                <div className="text-2xl">{step.icon}</div>
                <p className="mt-2 text-[14px] font-medium text-ivory">{step.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-dust">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[220px]">
          <Link
            href="/prompt/custom/olustur"
            className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-[13px] font-medium text-void transition-colors hover:bg-gold/90"
          >
            Hemen dene
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-hairline px-4 py-2.5 text-[13px] text-dust transition-colors hover:border-gold/30 hover:text-ivory"
          >
            Şimdi değil
          </button>
        </div>
      </div>
    </section>
  );
}
