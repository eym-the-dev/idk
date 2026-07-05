'use client';

import type { DiscoverItem } from '@/lib/prompt-engine/discoverTypes';
import {
  formatBadge,
  gradientForTitle,
  initialsForTitle,
} from '@/lib/prompt-engine/discoverUtils';

type Props = {
  item: DiscoverItem;
  rank?: number;
  featured?: boolean;
};

export function DiscoverCard({ item, rank, featured }: Props) {
  const safeTitle = item?.title ?? 'İsimsiz öneri';
  const gradient = gradientForTitle(safeTitle);
  const initials = initialsForTitle(safeTitle);
  const genres = Array.isArray(item?.genres) ? item.genres.filter(Boolean) : [];
  const safeFormat = item?.format ?? 'Yapım';
  const safeYear = item?.year ?? 'Bilinmiyor';
  const safeHook = item?.hook ?? 'Bu öneri için kısa bir açıklama eklenmedi.';
  const safeWhyMatch = item?.whyMatch ?? 'Bu önerinin kullanıcıya uygun olduğu belirtildi.';
  const safeVibe = item?.vibe ?? 'Genel bir ruh hali';
  const coverImage = item?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(safeTitle)}/900/1350`;
  const youtubeHref = item?.youtubeSearchQuery || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${safeTitle} ${safeFormat === 'Dizi' ? 'dizi' : 'film'} trailer`)}`;
  const longVideoHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${safeTitle} ${safeFormat === 'Dizi' ? 'dizi' : 'film'} izlemelik hafif uzun video`)}`;

  if (featured) {
    return (
      <article className="group w-full shrink-0">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-surface transition-colors hover:border-gold/30">
          <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${gradient}`}>
            <img src={coverImage} alt={safeTitle} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,161,91,0.12),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/20 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded bg-gold px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-void">
                #1 sana özel
              </span>
              <span className="rounded bg-void/70 px-2 py-0.5 text-[11px] text-ivory backdrop-blur">
                {formatBadge(safeFormat)}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-display text-4xl font-light text-ivory/20 md:text-5xl">
                {initials}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-xl text-ivory md:text-2xl">{safeTitle}</h3>
                <p className="mt-1 text-[12px] text-dust">
                  {safeYear} • {genres.slice(0, 2).join(' · ') || 'Genel öneri'}
                </p>
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-ivory/90">{safeHook}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-void/60 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dust">neden tuttu</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-dust">{safeWhyMatch}</p>
              </div>
              <div className="rounded-xl bg-void/60 px-3 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dust">hangi modda</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-dust">{safeVibe}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={youtubeHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-medium text-gold transition-colors hover:bg-gold/20"
              >
                Birlikte izle
              </a>
              <a
                href={longVideoHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-hairline px-3 py-1.5 text-[12px] text-dust transition-colors hover:border-gold/30 hover:text-gold"
              >
                İzlemelik video öner
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group w-[260px] shrink-0 snap-start sm:w-[280px]">
      <div className="overflow-hidden rounded-xl transition-transform duration-200 group-hover:-translate-y-0.5">
        <div className={`relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br ${gradient}`}>
          <img src={coverImage} alt={safeTitle} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(198,161,91,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-void/85 via-void/10 to-transparent" />
          {rank != null && (
            <span className="absolute left-2 top-2 rounded bg-void/75 px-1.5 py-0.5 font-mono text-[10px] text-gold backdrop-blur">
              #{rank}
            </span>
          )}
          <span className="absolute right-2 top-2 rounded bg-void/75 px-1.5 py-0.5 text-[10px] text-ivory backdrop-blur">
            {formatBadge(safeFormat)}
          </span>
          <div className="absolute bottom-2 left-3">
            <span className="font-display text-2xl text-ivory/25">{initials}</span>
          </div>
        </div>

        <div className="mt-2.5 px-0.5">
          <h3 className="line-clamp-2 font-medium text-[14px] leading-snug text-ivory group-hover:text-gold-soft transition-colors">
            {safeTitle}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-dust">{safeHook}</p>
          <p className="mt-1.5 text-[11px] text-fog">
            {safeYear}
            {genres[0] ? ` · ${genres[0]}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={youtubeHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 text-[11px] text-dust transition-colors hover:border-gold/30 hover:text-gold"
            >
              YouTube'da ara
            </a>
            <a
              href={longVideoHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-hairline px-2.5 py-1 text-[11px] text-dust transition-colors hover:border-gold/30 hover:text-gold"
            >
              İzlemelik video
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
