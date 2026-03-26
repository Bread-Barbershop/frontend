import { Metadata } from 'next';
import localFont from 'next/font/local';
import { ReactNode } from 'react';

import './styles/globals.css';

const pretendard = localFont({
  src: '../public/font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--pretendard',
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
