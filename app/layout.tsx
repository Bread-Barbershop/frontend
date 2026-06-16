import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { ReactNode } from 'react';

import { ConfirmContainer } from '@/components/molecules/confirm/ConfirmContainer';
import { ToastContainer } from '@/components/molecules/toast/ToastContainer';
import ClarityInit from '@/features/monitoring/ClarityInit';

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
  '함께하고 싶은 사람에게 마음을 전하는 일, 무료로 개인정보 없이 할 수 있어요.';

export const metadata: Metadata = {
  metadataBase: new URL('https://invia.co.kr'),
  applicationName: serviceName,
  title: {
    default: defaultTitle,
    template: `%s | ${serviceName}`,
  },
  description: defaultDescription,
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
        <div id="app-root">{children}</div>
        <Analytics />
        <SpeedInsights />
        <ClarityInit />
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
