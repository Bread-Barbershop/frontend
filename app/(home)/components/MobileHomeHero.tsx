'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import { MobileShowcaseCardStack } from './MobileShowcaseCardStack';
import { showcaseItems } from './showcaseItems';

const MOBILE_HOME_QUERY = '(max-width: 1339px)';

type ScrollLockSnapshot = {
  bodyOverflow: string;
  bodyOverscrollBehavior: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
};

function useMobileHomeViewport() {
  const scrollLockSnapshotRef = useRef<ScrollLockSnapshot | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_HOME_QUERY);
    const root = document.documentElement;
    const body = document.body;

    const updateViewportHeight = () => {
      if (!mediaQuery.matches) return;

      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      root.style.setProperty(
        '--mobile-home-viewport-height',
        `${Math.round(viewportHeight)}px`
      );
    };

    const lockScroll = () => {
      if (scrollLockSnapshotRef.current) return;

      scrollLockSnapshotRef.current = {
        bodyOverflow: body.style.overflow,
        bodyOverscrollBehavior: body.style.overscrollBehavior,
        htmlOverflow: root.style.overflow,
        htmlOverscrollBehavior: root.style.overscrollBehavior,
      };

      root.style.overflow = 'hidden';
      root.style.overscrollBehavior = 'none';
      body.style.overflow = 'hidden';
      body.style.overscrollBehavior = 'none';
    };

    const unlockScroll = () => {
      const snapshot = scrollLockSnapshotRef.current;
      if (!snapshot) return;

      root.style.overflow = snapshot.htmlOverflow;
      root.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
      body.style.overflow = snapshot.bodyOverflow;
      body.style.overscrollBehavior = snapshot.bodyOverscrollBehavior;
      root.style.removeProperty('--mobile-home-viewport-height');
      scrollLockSnapshotRef.current = null;
    };

    const syncMobileViewport = () => {
      if (mediaQuery.matches) {
        lockScroll();
        updateViewportHeight();
        return;
      }

      unlockScroll();
    };

    syncMobileViewport();

    mediaQuery.addEventListener('change', syncMobileViewport);
    window.addEventListener('resize', syncMobileViewport);
    window.addEventListener('orientationchange', syncMobileViewport);
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('scroll', updateViewportHeight);

    return () => {
      mediaQuery.removeEventListener('change', syncMobileViewport);
      window.removeEventListener('resize', syncMobileViewport);
      window.removeEventListener('orientationchange', syncMobileViewport);
      window.visualViewport?.removeEventListener(
        'resize',
        updateViewportHeight
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        updateViewportHeight
      );
      unlockScroll();
    };
  }, []);
}

function MobileHomeHero() {
  const [isPcGuideOpen, setIsPcGuideOpen] = useState(false);
  useMobileHomeViewport();

  return (
    <>
      <section className="fixed inset-0 isolate flex h-[var(--mobile-home-viewport-height,100vh)] w-full items-center justify-center overflow-hidden px-5 py-6 text-[#171717]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homeBackgroundImage.src})` }}
        />

        <div className="flex h-full w-full max-w-[335px] flex-col items-center justify-center overflow-visible">
          <section
            className="
              flex w-fit max-w-full items-center justify-center px-8 py-4
              rounded-[32px] border-x border-white/30 bg-white/6
              shadow-2xl backdrop-blur-xs supports-backdrop-filter:bg-white/6
            "
            style={{
              boxShadow: 'inset 8px 8px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="flex flex-col items-start gap-2 text-left text-text-plain">
              <p className="select-none text-[13px] font-medium leading-none tracking-[-0.01em]">
                Signature Invitation
              </p>
              <h1 className="select-none whitespace-nowrap text-[32px] font-black leading-[1.12] tracking-[-0.01em]">
                우리들의 이야기
                <br />
                첫시작은 초대장으로
              </h1>
              <p className="select-none whitespace-nowrap text-[12px] font-medium leading-none tracking-[-0.01em]">
                폰트·컬러·레이아웃까지, 우리만의 시그니처로
              </p>
            </div>
          </section>

          <MobileShowcaseCardStack cards={showcaseItems} />

          <button
            type="button"
            onClick={() => setIsPcGuideOpen(true)}
            className="
              mt-[27px] inline-flex cursor-pointer items-center justify-center rounded-full
              bg-[#121212] px-10 py-[13.5px] text-[14px] font-semibold
              leading-none tracking-[-0.01em] text-white transition-all
              hover:bg-[#202020] active:bg-[#0D0D0D]
            "
          >
            무료로 제작하기
          </button>
        </div>
      </section>

      <AnimatePresence>
        {isPcGuideOpen && (
          <motion.div
            className="fixed inset-0 z-[50000] flex items-center justify-center bg-[rgb(0_0_0_/_16%)] px-5"
            onClick={() => setIsPcGuideOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-pc-guide-title"
              aria-describedby="mobile-pc-guide-description"
              className="box-border flex h-fit w-[calc(100vw-40px)] min-w-[335px] max-w-[475px] flex-col items-center rounded-[12px] bg-white px-5 py-[10px] pt-6 text-center text-text-plain shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
              onClick={event => event.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <h2
                id="mobile-pc-guide-title"
                className="text-[20px] font-bold leading-none tracking-[-0.01em]"
              >
                {DESKTOP_CONTENT_MIN_WIDTH}px 이상의 브라우저에서 이용해 주세요!
              </h2>
              <p
                id="mobile-pc-guide-description"
                className="mt-6 text-[14px] font-medium leading-[22px]"
              >
                현재 화면에서는 해당 기능을 이용하기 어려워요.
                <br />
                브라우저 창을 넓히거나 더 큰 화면에서 이용해 주세요.
              </p>
              <button
                type="button"
                onClick={() => setIsPcGuideOpen(false)}
                className="mt-1.5 inline-flex cursor-pointer items-center justify-center rounded-[8px] bg-white px-8 py-[13.5px] text-[14px] font-semibold leading-none text-[#FF0000] transition-colors hover:bg-[#FAFAFB] active:bg-[#FFF3F3]"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileHomeHero;
