import { ReactNode } from 'react';

import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import FooterPolicyLink from './FooterPolicyLink';
import HeaderAuthControl from './HeaderAuthControl';
import HeaderPrivacyNoticeButton from './HeaderPrivacyNoticeButton';
import HomeButton from './HomeButton';
import NavMenu from './NavMenu';

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

      <header className="relative z-30 h-14 bg-transparent flex items-center justify-between px-10">
        <div className="flex h-full items-center gap-8">
          <HomeButton />

          <nav className="flex h-full items-center gap-6">
            <HeaderAuthControl initialIsLoggedIn={session.isLoggedIn} />

            <NavMenu />
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
