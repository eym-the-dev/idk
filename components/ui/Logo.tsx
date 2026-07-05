type LogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** true ise noktalar sırayla parlar — yükleme / "düşünüyor" hali için */
  pulsing?: boolean;
  className?: string;
};

const sizeMap = {
  sm: 'text-lg gap-1.5',
  md: 'text-2xl gap-2',
  lg: 'text-4xl gap-3',
  xl: 'text-6xl sm:text-7xl gap-4',
};

const dotSizeMap = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
  xl: 'w-2.5 h-2.5',
};

/**
 * I-D-K'nın imza öğesi: harfleri altın noktalarla ayıran seri wordmark.
 * pulsing=true olduğunda noktalar sırayla yanıp söner (öneri "düşünülürken"
 * veya sayfa geçişlerinde kullanılır) — markanın "bilmiyorum ama öğreniyorum"
 * fikrini tek bir mikro-animasyonla taşır.
 */
export function Logo({ size = 'md', pulsing = false, className = '' }: LogoProps) {
  const letters = ['I', 'D', 'K'];

  return (
    <span
      role="img"
      aria-label="I-D-K"
      className={`inline-flex items-center font-display italic font-light text-ivory ${sizeMap[size]} ${className}`}
    >
      {letters.map((letter, i) => (
        <span key={letter} className="inline-flex items-center">
          <span>{letter}</span>
          {i < letters.length - 1 && (
            <span
              className={`mx-[0.35em] rounded-full bg-gold ${dotSizeMap[size]} ${
                pulsing ? 'animate-dot-pulse' : ''
              }`}
              style={pulsing ? { animationDelay: `${i * 0.2}s` } : undefined}
              aria-hidden="true"
            />
          )}
        </span>
      ))}
    </span>
  );
}
