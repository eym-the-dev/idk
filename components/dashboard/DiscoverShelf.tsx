'use client';

import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DiscoverShelf({ title, subtitle, children }: Props) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-4 px-0.5">
        <div>
          <h2 className="font-display text-xl text-ivory md:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-dust">{subtitle}</p>}
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-3 px-1 snap-x snap-mandatory">{children}</div>
      </div>
    </section>
  );
}
