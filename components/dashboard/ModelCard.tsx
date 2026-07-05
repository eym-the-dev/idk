import Link from 'next/link';

type ModelCardProps = {
  slug: string;
  name: string;
  hint: string;
};

export function ModelCard({ slug, name, hint }: ModelCardProps) {
  return (
    <Link
      href={`/prompt/${slug}`}
      className="group rounded-lg border border-hairline bg-surface p-5 transition-colors hover:border-gold hover:bg-surface-raised"
    >
      <p className="font-display text-xl text-ivory">{name}</p>
      <p className="font-mono text-[11px] uppercase tracking-wide text-dust mt-1 group-hover:text-gold transition-colors">
        {hint}
      </p>
    </Link>
  );
}
