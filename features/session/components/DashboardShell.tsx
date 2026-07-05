import Link from 'next/link';
import { ReactNode } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import { DASHBOARD_SHELL_NAV_MENU } from '@/features/session/config/dashboardShell.config';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import FooterPolicyLink from './FooterPolicyLink';
import HeaderAuthControl from './HeaderAuthControl';
import HeaderPrivacyNoticeButton from './HeaderPrivacyNoticeButton';
import HomeButton from './HomeButton';

const HEADER_NAV_LINK_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-text-plain transition-colors hover:border-black hover:text-black';

export default async function DashboardShell({
  children,
  variant = 'default',
  minimumWidth,
}: Readonly<{
  children: ReactNode;
  variant?: 'default' | 'editor';
  minimumWidth?: number;
}>) {
  const session = await getAuthSession();
  const isEditor = variant === 'editor';

  return (
    <div
      className={`relative isolate min-h-dvh grid grid-rows-[auto_1fr_auto] ${
        minimumWidth ? 'overflow-x-auto' : 'overflow-x-hidden'
      } ${isEditor ? 'bg-[#E7E9EB]' : 'bg-transparent'}`}
      style={{
        ...(minimumWidth ? { minWidth: `${minimumWidth}px` } : {}),
      }}
    >
      {!isEditor && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homeBackgroundImage.src})` }}
        />
      )}

      <header className="h-14 bg-transparent flex items-center justify-between px-10">
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
        <FooterPolicyLink className="text-text-secondary" />

        <div className="text-text-secondary">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold">Invia</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
