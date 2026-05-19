import { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode } from 'react';

import { ConfirmContainer } from '@/components/molecules/confirm/ConfirmContainer';
import { ToastContainer } from '@/components/molecules/toast/ToastContainer';

import './styles/globals.css';

const pretendard = localFont({
  src: '../public/font/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--pretendard',
});
const inter = Inter({
  variable: '--inter',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const notoSansKr = Noto_Sans_KR({
  variable: '--noto-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const lineSeedKr = localFont({
  src: [
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Th.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Rg.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/font/LINESeedKR/LINESeedKR-Bd.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--line-seed-kr',
});

const serviceName = 'Invia';
const defaultTitle = 'Invia | 초대장의 새로운 기준';
const defaultDescription =
  '모든 종류의 초대장을 무료로 만드세요. 개인정보를 요구하지 않으며, 모든 데이터는 당신의 Google Drive에 안전하게 보관됩니다. 기록이 남지 않는 가장 투명한 초대장 서비스.';

export const metadata: Metadata = {
  metadataBase: new URL('https://invia.co.kr'),
  applicationName: serviceName,
  title: {
    default: defaultTitle,
    template: `%s | ${serviceName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: '/',
    siteName: serviceName,
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${inter.variable} ${notoSansKr.variable} ${lineSeedKr.variable}`}
    >
      <body className="antialiased font-pretendard">
        {children}
        <ToastContainer />
        <ConfirmContainer />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
          integrity="sha384-JpLApTkB8lPskhVMhT+m5Ln8aHlnS0bsIexhaak0jOhAkMYedQoVghPfSpjNi9K1"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
