'use client';

import { ArrowUpRight, Home, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import HeaderPrivacyNoticeButton from '@/features/session/components/HeaderPrivacyNoticeButton';
import HomeButton from '@/features/session/components/HomeButton';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import type { ReactNode } from 'react';

const HEADER_NAV_LINK_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-[#121212] transition-colors hover:border-black hover:text-black';

function EditorDesktopNotice({
  viewportWidth,
}: {
  viewportWidth: number | null;
}) {
  return (
    <div className="fixed inset-0 isolate z-[100] grid min-h-dvh grid-rows-[auto_1fr_auto] overflow-y-auto text-[#171717]">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBackgroundImage.src})` }}
      />

      <header className="relative flex h-14 items-center justify-between bg-transparent px-10">
        <div className="flex h-full items-center gap-8">
          <HomeButton />

          <nav className="flex h-full items-center gap-6">
            <Link href="/faq" className={HEADER_NAV_LINK_CLASS}>
              FAQ
            </Link>
          </nav>
        </div>

        <HeaderPrivacyNoticeButton />
      </header>

      <main className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:gap-20 lg:px-12 lg:py-20">
        <section>
          <p className="text-xs font-bold tracking-[0.24em] text-black/45">
            WIDER WORKSPACE REQUIRED
          </p>
          <h1 className="mt-6 max-w-3xl text-[clamp(4rem,9vw,8.8rem)] font-semibold leading-[0.88]">
            Create on
            <br />
            desktop.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
            초대장은 데스크톱에서 만들어 주세요.
            <br />
            섬세한 편집을 위해 {DESKTOP_CONTENT_MIN_WIDTH}px 이상의 브라우저
            너비가 필요합니다.
          </p>
        </section>

        <section className="border-t border-black lg:border-t-0">
          <div className="flex items-end justify-between gap-6 border-b border-black/15 py-6">
            <span className="text-xs font-bold tracking-[0.2em] text-black/40">
              WORKSPACE WIDTH
            </span>
            <Maximize2 className="h-7 w-7 text-black/60" />
          </div>

          <div className="grid grid-cols-2 border-b border-black/15">
            <div className="border-r border-black/15 py-5 pr-4">
              <p className="text-xs font-bold tracking-[0.16em] text-black/40">
                REQUIRED
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
                {DESKTOP_CONTENT_MIN_WIDTH}px+
              </p>
            </div>
            <div className="py-5 pl-4">
              <p className="text-xs font-bold tracking-[0.16em] text-black/40">
                CURRENT
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
                {viewportWidth === null ? 'Checking' : `${viewportWidth}px`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-6">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              홈으로 돌아가기
              <Home className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/20 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-black"
            >
              FAQ 살펴보기
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative flex h-10 items-center justify-between bg-transparent px-10">
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

function EditorViewportGuard({ children }: { children: ReactNode }) {
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateViewportWidth = () => {
      const nextViewportWidth = window.innerWidth;

      setViewportWidth(nextViewportWidth);
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);

    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  const shouldShowDesktopNotice =
    viewportWidth !== null && viewportWidth < DESKTOP_CONTENT_MIN_WIDTH;

  return (
    <>
      {children}
      {shouldShowDesktopNotice && (
        <EditorDesktopNotice viewportWidth={viewportWidth} />
      )}
    </>
  );
}

export default EditorViewportGuard;
