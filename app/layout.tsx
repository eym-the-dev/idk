import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-provider';
import { SecretKeyListener } from '@/components/easter-eggs/SecretKeyListener';
import { HiddenButtons } from '@/components/easter-eggs/HiddenButtons';
import { AdminEggPanel } from '@/components/easter-eggs/AdminEggPanel';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'I-D-K — ne izleyeceğini biz biliriz',
  description:
    'Alışkanlıklarından öğrenen, sana özel prompt üreten kişiselleştirilmiş içerik öneri motoru.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          {children}
          <HiddenButtons />
          <AdminEggPanel />
          <SecretKeyListener />
        </ThemeProvider>
      </body>
    </html>
  );
}
