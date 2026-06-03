import Link from 'next/link';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/features/session/config/dashboardShell.config';

import {
  dashboardCarouselLayout,
  dashboardCarouselVars,
} from './carouselLayout';

function EmptyInvitationCard() {
  const selectedLift = `calc(${dashboardCarouselLayout.dashboardSelectedLift} + ${dashboardCarouselLayout.headerHeight})`;

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
          <div
            className="flex flex-col items-center justify-center rounded-xl bg-white/90 px-5 text-center"
            style={{
              width: dashboardCarouselLayout.cardWidth,
              height: dashboardCarouselLayout.selectedVisualHeight,
              boxShadow: dashboardCarouselLayout.sideActionShadow,
            }}
          >
            <p className="text-lg font-semibold text-[#121212]">
              아직 만든 초대장이 없어요.
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              첫 초대장을 만들어보세요.
            </p>
            <Link
              href="/editor"
              className="mt-6 flex h-8 w-[180px] items-center justify-center rounded-lg bg-[#121212] text-[13px] font-semibold text-white transition-colors hover:bg-[#202020] active:bg-[#0D0D0D]"
            >
              초대장 만들러 가기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmptyInvitationCard;
