const GRADIENTS = [
  'from-[#2a1f3d] via-[#1a1528] to-[#0f0d14]',
  'from-[#1f2a3d] via-[#141c28] to-[#0d1014]',
  'from-[#3d2a1f] via-[#281a14] to-[#140f0d]',
  'from-[#1f3d2a] via-[#14281a] to-[#0d140f]',
  'from-[#3d1f2a] via-[#28141a] to-[#140d0f]',
  'from-[#2a3d1f] via-[#1a2814] to-[#0f140d]',
  'from-[#1f3d3d] via-[#142828] to-[#0d1414]',
  'from-[#3d3d1f] via-[#282814] to-[#14140d]',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeText(value?: string | null): string {
  return typeof value === 'string' ? value : '';
}

export function gradientForTitle(title?: string | null): string {
  const safeTitle = normalizeText(title) || 'untitled';
  return GRADIENTS[hashString(safeTitle) % GRADIENTS.length];
}

export function initialsForTitle(title?: string | null): string {
  const safeTitle = normalizeText(title).trim();
  const words = safeTitle.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function formatBadge(format?: string | null): string {
  const lower = normalizeText(format).toLowerCase();
  if (lower.includes('dizi')) return 'Dizi';
  if (lower.includes('film')) return 'Film';
  return normalizeText(format) || 'Yapım';
}
