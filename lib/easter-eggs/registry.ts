export type EasterEgg = {
  key: string;
  /** Bir metin girişinde tetiklenir mi kontrol eder (arama, DM, vb.) */
  matchesText?: (input: string) => boolean;
  message: string;
};

// Yeni bir easter egg eklemek = bu diziye bir obje eklemek kadar basit.
// Kod tabanının geri kalanı bu dosyayı hiç bilmez — tamamen izole bir katman.
export const textEasterEggs: EasterEgg[] = [
  {
    key: 'melisa_search',
    matchesText: (input) => input.toLowerCase().includes('melisa'),
    message: "Bu öneriyi Melisa'ya da göstersen mi?",
  },
];

export function findTextEasterEgg(input: string): EasterEgg | undefined {
  if (!input) return undefined;
  return textEasterEggs.find((egg) => egg.matchesText?.(input));
}

// ================================================================
// GİZLİ TUŞ KOMBİNASYONU EASTER EGG'İ
// ================================================================
// Kasıtlı olarak çok nadir: doğru tuş dizisi girilse bile sadece
// RARITY şansıyla gösterilir. Bu, "her denediğimde çıkıyor" hissini
// kırıp gerçekten tesadüfen karşılaşılan, özel bir an gibi hissettirir.
// Sıra, uygulamanın görünür hiçbir yerinde yazmaz — kod dışında kimse
// bilemez, bu yüzden mesajın içeriğini de burada tekrar etmiyoruz.
export const secretSequenceEgg = {
  key: 'gizli_soz',
  sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  rarity: 1 / 12,
  messages: [
    'En iyisi de olsan, onun yeri ayrı her zaman.',
    'Bazı yerler hep boş kalır — kimse dolduramaz.',
  ],
};
