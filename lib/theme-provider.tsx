'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

/**
 * I-D-K şu an için tamamen "premium siyah" kimliğiyle çıkıyor, bu yüzden
 * forcedTheme="dark" ile açık tema devre dışı bırakıldı. İleride kullanıcıya
 * tema seçimi sunmak istersek tek yapılacak şey forcedTheme satırını silmek —
 * next-themes altyapısı (class stratejisi, sistem teması algılama vb.)
 * zaten hazır bekliyor.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
