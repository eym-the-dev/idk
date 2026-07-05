import type { Config } from 'tailwindcss';

// I-D-K marka token sistemi
// Palet: "ıslak mürekkep siyahı" zemin + soluk saten altın vurgu.
// Amaç: lüks/butik hissi — parlak neon değil, düşük ışıklı, dokulu bir karanlık.
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0B',        // sayfa zemini
        surface: '#141416',      // kart zemini
        'surface-raised': '#1D1D20', // hover / yükseltilmiş yüzey
        hairline: '#29292D',     // ince ayraç çizgisi
        'hairline-strong': '#38383D',
        ivory: '#F3F0E9',        // birincil metin (kırık beyaz — steril değil)
        dust: '#96938C',         // ikincil metin
        fog: '#605D57',          // üçüncül / devre dışı metin
        gold: {
          DEFAULT: '#C6A15B',
          soft: '#E8C97A',
          deep: '#8F7539',
        },
        emerald: '#2E6E52',
        rust: '#A8462F',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '14px',
      },
      boxShadow: {
        'gold-glow': '0 0 0 1px rgba(198, 161, 91, 0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'dot-pulse': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'dot-pulse': 'dot-pulse 1.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
