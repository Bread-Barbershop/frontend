'use client';

import { motion, useAnimationControls } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import emptyCardImage from '@/shared/assets/images/dashboard/empty-card.png';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import {
  dashboardCarouselLayout,
  dashboardCarouselVars,
} from './carouselLayout';
import CarouselController from './controller/CarouselController';

function EmptyInvitationCard() {
  const selectedLift = `calc(${dashboardCarouselLayout.dashboardSelectedLift} + ${dashboardCarouselLayout.headerHeight})`;
  const cardControls = useAnimationControls();
  const isAnimatingRef = useRef(false);

  const handleBlockedMove = async (direction: 'left' | 'right') => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    cardControls.stop();

    try {
      await cardControls.start({
        x: direction === 'left' ? -14 : 14,
        transition: { duration: 0.12, ease: 'easeOut' },
      });
      await cardControls.start({
        x: 0,
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      });
    } finally {
      isAnimatingRef.current = false;
    }
  };

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{
        height: dashboardCarouselLayout.dashboardStageHeight,
        minWidth: DESKTOP_CONTENT_MIN_WIDTH,
      }}
    >
      <div
        className="h-full w-full overflow-hidden"
        style={{
          ...dashboardCarouselVars,
          paddingTop: 'var(--carousel-safe-top)',
          paddingBottom: `calc(var(--carousel-safe-bottom) + ${dashboardCarouselLayout.controllerClearance})`,
        }}
      >
        <div
          className="relative flex justify-center"
          style={{
            top: 'calc(var(--carousel-base-offset) - var(--carousel-safe-top))',
            transform: `translateY(calc(-1 * ${selectedLift}))`,
          }}
        >
          <motion.div
            animate={cardControls}
            className="flex flex-col items-center rounded-xl bg-white/90 pt-[160px] text-center"
            style={{
              width: dashboardCarouselLayout.cardWidth,
              height: dashboardCarouselLayout.selectedVisualHeight,
              boxShadow: dashboardCarouselLayout.sideActionShadow,
            }}
          >
            <Image
              src={emptyCardImage}
              alt=""
              width={120}
              height={120}
              priority
            />
            <p className="mt-5 font-pretendard text-[16px] font-semibold leading-5 text-[#121212]">
              아직 만든 초대장이 없어요.
            </p>
            <p className="mt-[99px] font-pretendard text-[13px] font-medium leading-[18px] text-[#121212]">
              첫 초대장을 만들어 보세요.
            </p>
            <Link
              href="/editor"
              className="mt-1.5 flex h-8 w-[217px] items-center justify-center rounded-lg bg-[#121212] font-pretendard text-[14px] font-semibold leading-5 text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D]"
            >
              무료로 제작하기
            </Link>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <CarouselController
          onMove={direction => {
            void handleBlockedMove(direction);
          }}
        />
      </div>
    </section>
  );
}

export default EmptyInvitationCard;
