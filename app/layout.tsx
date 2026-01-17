import localFont from 'next/font/local';
import { ReactNode } from 'react';
import './styles/globals.css';




const pretendard = localFont({
  src: '@/public/fonts/PretendardVariable.woff2',
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
      <body>{children}</body>
    </html>
  );
}
