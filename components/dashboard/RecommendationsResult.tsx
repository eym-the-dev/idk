import type { DiscoverItem } from '@/lib/prompt-engine/discoverTypes';
import { DiscoverCard } from '@/components/dashboard/DiscoverCard';
import { DiscoverShelf } from '@/components/dashboard/DiscoverShelf';

type Profile = {
  current_mood: string | null;
  preferred_vibe: string | null;
  disliked_genres: string[] | null;
};

export function RecommendationsResult({
  profile,
  items,
  watchedItems,
  toWatchItems,
  modelName,
  justUpdated,
  personalitySummary,
  shelfTitle,
}: {
  profile: Profile;
  items: DiscoverItem[];
  watchedItems?: DiscoverItem[];
  toWatchItems?: DiscoverItem[];
  modelName?: string;
  justUpdated?: boolean;
  personalitySummary?: string;
  shelfTitle?: string;
}) {
  const badges = [profile.current_mood, profile.preferred_vibe, ...(profile.disliked_genres ?? [])].filter(
    Boolean
  ) as string[];
  const watched = watchedItems ?? [];
  const toWatch = toWatchItems ?? items;
  const [featured, ...rest] = toWatch;

  return (
    <div className="mb-14 -mx-2 md:-mx-4">
      {justUpdated && (
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-emerald mb-3 animate-fade-up px-2 md:px-4">
          keşfet rafın güncellendi ✓
        </p>
      )}

      <div className="px-2 md:px-4 mb-6">
        <span className="font-mono text-[11px] tracking-widest2 uppercase text-gold">
          izleyeceklerin
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ivory mt-2 mb-2">
          {shelfTitle || 'Sana göre keşfet'}
        </h1>
        <p className="text-[14px] text-dust max-w-2xl">
          {modelName ? `${modelName} lensiyle özetlenen kişiliğine göre` : 'Kişiliğine göre'}{' '}
          Gemini sana 8 yapım seçti. Bu, izlenecekler listenin ilk rafı.
        </p>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-hairline px-3 py-1 text-[12px] text-dust"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {personalitySummary && (
        <div className="mx-2 md:mx-4 mb-8 rounded-2xl border border-gold/15 bg-surface/80 p-4 md:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold">
            izleme dna'n
          </p>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-dust line-clamp-4 md:line-clamp-none">
            {personalitySummary}
          </p>
        </div>
      )}

      {watched.length === 0 && toWatch.length === 0 ? (
        <p className="px-2 md:px-4 text-[14px] text-fog">
          Bu kez keşfet akışı oluşmadı. Yeniden deneyince Gemini yeni bir raf hazırlayacak.
        </p>
      ) : (
        <>
          {watched.length > 0 && (
            <div className="px-2 md:px-4 mb-8">
              <DiscoverShelf title="İzlenenler" subtitle="Zaten bitirdiğin veya sevdiğin seçimler">
                {watched.map((item, i) => (
                  <DiscoverCard key={`${item.title}-${i}`} item={item} rank={i + 1} />
                ))}
              </DiscoverShelf>
            </div>
          )}

          {toWatch.length > 0 && (
            <>
              {featured && (
                <div className="px-2 md:px-4 mb-8">
                  <DiscoverCard item={featured} featured />
                </div>
              )}

              {rest.length > 0 && (
                <div className="px-2 md:px-4">
                  <DiscoverShelf
                    title="İzlenecekler"
                    subtitle="Bu hafta senin listende olan seçimler — sağa kaydır"
                  >
                    {rest.map((item, i) => (
                      <DiscoverCard key={`${item.title}-${i}`} item={item} rank={i + 2} />
                    ))}
                  </DiscoverShelf>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
