export type ParsedRecommendation = {
  title: string;
  detail: string;
};

/**
 * Kullanıcının yapıştırdığı ham AI cevabını basit, gösterilebilir maddelere
 * ayırır. Mükemmel bir NLP ayrıştırıcı değil — amaç, "hiçbir şey olmadı"
 * hissini kırıp yapıştırılan cevabın gerçekten işlendiğini göstermek.
 * Madde işaretli satırları ("- ", "* ", "• ", "1. " vb.) yakalar; her
 * satırı "başlık — açıklama" gibi ayırmayı dener, olmazsa satırın tamamını
 * başlık olarak kullanır.
 */
export function parseSignals(rawResponse: string): ParsedRecommendation[] {
  const lines = rawResponse
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const bulletRe = /^(?:[-*•]|\d+[.)])\s+/;
  const items: ParsedRecommendation[] = [];

  for (const line of lines) {
    if (!bulletRe.test(line)) continue;
    const clean = line.replace(bulletRe, '').replace(/\*\*/g, '');

    // "Başlık: açıklama" veya "Başlık — açıklama" formatlarını ayır
    const splitMatch = clean.match(/^(.{2,60}?)[:—–-]\s+(.+)$/);
    if (splitMatch) {
      items.push({ title: splitMatch[1].trim(), detail: splitMatch[2].trim() });
    } else {
      items.push({ title: clean, detail: '' });
    }
  }

  return items.slice(0, 8);
}
