import Link from 'next/link';
import { ReactNode } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { DASHBOARD_SHELL_NAV_MENU } from '@/features/session/config/dashboardShell.config';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import HeaderAuthControl from './HeaderAuthControl';
import HeaderPrivacyNoticeButton from './HeaderPrivacyNoticeButton';
import HomeButton from './HomeButton';

const HEADER_NAV_LINK_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-[#121212] transition-colors hover:border-black hover:text-black';

export default async function DashboardShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <div
      className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${homeBackgroundImage.src})` }}
    >
      <header className="h-15.5 bg-white flex items-center justify-between px-10">
        <div className="flex h-full items-center gap-8">
          <HomeButton />

          <nav className="flex h-full items-center gap-6">
            <HeaderAuthControl initialIsLoggedIn={session.isLoggedIn} />

            {DASHBOARD_SHELL_NAV_MENU.map(menu => (
              <Link
                key={`${menu.title}-${menu.href}`}
                href={menu.href}
                className={HEADER_NAV_LINK_CLASS}
              >
                {menu.title}
              </Link>
            ))}
          </nav>
        </div>

        <HeaderPrivacyNoticeButton />
      </header>

      <main className="relative max-w-480 w-full mx-auto min-h-0 flex flex-col justify-end">
        {children}
      </main>

      <footer className="h-10 bg-transparent flex items-center justify-between px-10">
        <Link href="/policy" className="text-text-secondary">
          개인정보 처리방침
        </Link>

        <div className="text-text-secondary">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold">Invia</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
