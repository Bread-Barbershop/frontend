import { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { ReactNode } from 'react';

import './styles/globals.css';

const NAV_MENU = [
  { title: 'TITLE', href: '#' },
  { title: 'TITLE', href: '#' },
  { title: 'FAQ', href: '#' },
];

export const metadata: Metadata = {
  title: {
    default: '미정 | 초대장의 새로운 기준',
    template: '%s | 미정',
  },
  description:
    '결혼식, 돌잔치, 기업 행사까지. 당신의 Google Drive에 직접 저장되어 안전하게 소유되는 차세대 초대장 서비스.',
  openGraph: {
    title: '미정 | 초대장의 새로운 기준',
    description:
      '결혼식, 돌잔치, 기업 행사까지. 당신의 Google Drive에 직접 저장되어 안전하게 소유되는 차세대 초대장 서비스.',
    url: 'https://teambred.vercel.app',
    siteName: '미정',
    locale: 'ko_KR',
    type: 'website',
  },
};

const pretendard = localFont({
  src: '../public/font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="min-h-screen flex flex-col bg-[#eeeeee]">
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

            <Link href="/empty" className="text-text-secondary ml-4">
              <div className="w-10 h-10 bg-transparent rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-neutral-50 transition-colors"></div>
            </Link>
          </div>
        </header>

        <main className="flex-1 max-w-480 w-full mx-auto">{children}</main>

        <footer className="h-15.5 bg-transparent flex items-center justify-between px-10">
          <Link href="/empty" className="text-text-secondary">
            개인정보 처리방침
          </Link>

          <div className="text-text-secondary">
            © {new Date().getFullYear()} <span>미정</span>. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
