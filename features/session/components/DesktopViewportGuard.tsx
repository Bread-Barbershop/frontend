'use client';

import { Home, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';
import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';

import HeaderPrivacyNoticeButton from './HeaderPrivacyNoticeButton';
import HomeButton from './HomeButton';

const DESKTOP_GUARD_EXCLUDED_PREFIXES = ['/guest'];

function isExcludedRoute(pathname: string) {
  return DESKTOP_GUARD_EXCLUDED_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function DesktopRequiredNotice({
  viewportWidth,
}: {
  viewportWidth: number | null;
}) {
  return (
    <div className="fixed inset-0 isolate z-[40000] grid min-h-dvh grid-rows-[auto_1fr_auto] overflow-y-auto text-[#171717]">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${homeBackgroundImage.src})` }}
      />

      <header className="relative flex h-14 items-center justify-between bg-transparent px-5 sm:px-8 lg:px-12">
        <div className="flex h-full items-center gap-8">
          <HomeButton className="px-0" />
        </div>

        <div className="hidden h-full sm:block">
          <HeaderPrivacyNoticeButton />
        </div>
      </header>

      <main className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:gap-20 lg:px-12 lg:py-20">
        <section>
          <p className="text-xs font-bold text-black/45">
            WIDER WORKSPACE REQUIRED
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            모바일 화면은
            <br />
            아직 준비 중이에요.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
            불편을 드려 죄송해요. 작은 화면에서도 편하게 이용하실 수 있도록
            준비하고 있습니다.
            <br />
            업데이트 전까지는 데스크탑에서 이용해 주세요.
          </p>
        </section>

        <section className="border-t border-black lg:border-t-0">
          <div className="flex items-end justify-between gap-6 border-b border-black/15 py-6">
            <span className="text-xs font-bold text-black/40">
              WORKSPACE WIDTH
            </span>
            <Maximize2 className="h-7 w-7 text-black/60" />
          </div>

          <div className="grid grid-cols-2 border-b border-black/15">
            <div className="border-r border-black/15 py-5 pr-4">
              <p className="text-xs font-bold text-black/40">REQUIRED</p>
              <p className="mt-3 text-2xl font-semibold">
                {DESKTOP_CONTENT_MIN_WIDTH}px+
              </p>
            </div>
            <div className="py-5 pl-4">
              <p className="text-xs font-bold text-black/40">CURRENT</p>
              <p className="mt-3 text-2xl font-semibold">
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
          </div>
        </section>
      </main>

      <footer className="relative flex h-10 items-center justify-between bg-transparent px-5 sm:px-8 lg:px-12">
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

function DesktopViewportGuard() {
  const pathname = usePathname();
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const hideAllCallouts = useEditorCalloutStore(state => state.hideAllCallouts);
  const shouldBypassGuard = isExcludedRoute(pathname);

  useEffect(() => {
    if (shouldBypassGuard) return;

    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);

    return () => window.removeEventListener('resize', updateViewportWidth);
  }, [shouldBypassGuard]);

  const shouldShowDesktopNotice =
    !shouldBypassGuard &&
    viewportWidth !== null &&
    viewportWidth < DESKTOP_CONTENT_MIN_WIDTH;

  useEffect(() => {
    const root = document.getElementById('app-root');
    if (!root) return;

    if (shouldShowDesktopNotice) {
      root.setAttribute('inert', '');
      root.setAttribute('aria-hidden', 'true');
      hideAllCallouts();

      return () => {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      };
    }

    root.removeAttribute('inert');
    root.removeAttribute('aria-hidden');
  }, [hideAllCallouts, shouldShowDesktopNotice]);

  if (!shouldShowDesktopNotice) return null;

  return <DesktopRequiredNotice viewportWidth={viewportWidth} />;
}

export default DesktopViewportGuard;
