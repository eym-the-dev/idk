'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

type NavItem = { href: string; label: string; icon: JSX.Element };

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Keşfet', icon: <IconCompass /> },
  { href: '/watch-party', label: 'Beraber İzle', icon: <IconPlay /> },
  { href: '/friends', label: 'Arkadaşlar', icon: <IconUsers /> },
  { href: '/dm', label: 'Mesajlar', icon: <IconChat /> },
];

/**
 * Aynı uygulamanın PC ve telefon için kasıtlı olarak farklı iki iskeleti.
 * PC: kalıcı sol sidebar, geniş içerik alanı, masaüstü yoğunluğu.
 * Telefon: üstte sade başlık + altta sabit tab bar — native app hissi.
 * Tailwind breakpoint'i (md:) ile aynı anda tek biri render edilir;
 * ikisi de DOM'da mevcut ama CSS ile gösterilip gizlenir (SSR-safe).
 */
export function AppShell({ children, username }: { children: React.ReactNode; username?: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-void md:flex">
      {/* ---- PC: sol sidebar ---- */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-hairline md:py-8 md:px-6 md:sticky md:top-0 md:h-screen">
        <Logo size="sm" className="mb-10 px-2" />
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                pathname === item.href
                  ? 'bg-surface-raised text-ivory'
                  : 'text-dust hover:text-ivory hover:bg-surface'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/hesap"
          className={`mt-auto px-2 py-2 rounded-lg font-mono text-[12px] transition-colors ${
            pathname === '/hesap' ? 'text-ivory bg-surface-raised' : 'text-dust hover:text-ivory'
          }`}
        >
          @{username ?? '...'}
        </Link>
      </aside>

      {/* ---- Telefon: üst başlık ---- */}
      <header className="flex md:hidden items-center justify-between px-5 py-4 border-b border-hairline sticky top-0 bg-void/95 backdrop-blur z-10">
        <Logo size="sm" />
        <Link href="/hesap" className="font-mono text-[12px] text-dust hover:text-ivory transition-colors">
          @{username ?? '...'}
        </Link>
      </header>

      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      {/* ---- Telefon: alt tab bar ---- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-hairline bg-void/95 backdrop-blur flex justify-around py-3 z-10">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono uppercase tracking-wide ${
              pathname === item.href ? 'text-gold' : 'text-dust'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function IconCompass() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M15 14.2c2.5.4 4.5 2.6 4.5 5.8" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5h16v11H8l-4 4V5z" />
    </svg>
  );
}
