import Link from 'next/link';
import { ReactNode } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { DASHBOARD_SHELL_NAV_MENU } from '@/features/session/config/dashboardShell.config';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import HeaderAuthControl from './HeaderAuthControl';

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
        <Link href="/" className="font-semibold text-xl text-black">
          INVIA
        </Link>

        <div className="flex items-center h-full">
          {DASHBOARD_SHELL_NAV_MENU.map(menu => (
            <Link
              key={`${menu.title}-${menu.href}`}
              href={menu.href}
              className="text-text-secondary h-full px-8 flex items-center text-[14px] font-semibold hover:text-black transition-colors"
            >
              {menu.title}
            </Link>
          ))}

          <HeaderAuthControl initialIsLoggedIn={session.isLoggedIn} />
        </div>
      </header>

      <main className="max-w-480 w-full mx-auto min-h-0">{children}</main>

      <footer className="h-10 bg-transparent flex items-center justify-between px-10">
        <Link href="/empty" className="text-text-secondary">
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
