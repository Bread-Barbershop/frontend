import Link from 'next/link';
import { ReactNode } from 'react';

import HeaderAuthControl from '@/app/(home)/components/HeaderAuthControl';
import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';

const NAV_MENU = [
  { title: 'TITLE', href: '#' },
  { title: 'TITLE', href: '#' },
  { title: 'FAQ', href: '#' },
];

export default async function HomeLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-white">
      <header className="h-15.5 bg-white flex items-center justify-between px-10">
        <Link href="/" className="font-semibold text-xl text-black">
          브랜드 로고
        </Link>

        <div className="flex items-center h-full">
          {NAV_MENU.map((menu, index) => (
            <Link
              key={index}
              href={menu.href}
              className="text-text-secondary h-full px-8 flex items-center hover:text-black transition-colors"
            >
              {menu.title}
            </Link>
          ))}

          <HeaderAuthControl initialIsLoggedIn={session.isLoggedIn} />
        </div>
      </header>

      <main className="max-w-480 w-full mx-auto min-h-0">{children}</main>

      <footer className="h-15.5 bg-transparent flex items-center justify-between px-10">
        <Link href="/empty" className="text-text-secondary">
          개인정보 처리방침
        </Link>

        <div className="text-text-secondary">
          © {new Date().getFullYear()} <span>미정</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
