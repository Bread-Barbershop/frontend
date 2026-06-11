import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import {
  dashboardCarouselLayout,
  dashboardCarouselVars,
} from './carouselLayout';

import type { CSSProperties } from 'react';

type DashboardCarouselSkeletonProps = {
  count?: number;
  stageHeight?: string;
};

type SkeletonSlideProps = {
  index: number;
  isSelected: boolean;
  selectedLift: string;
};

const DEFAULT_SKELETON_COUNT = 5;
const SKELETON_PHASE_STEP_MS = 180;

function getSelectedTrackLeft(selectedIndex: number) {
  const cardWidth = Number.parseFloat(dashboardCarouselLayout.cardWidth);
  const trackGap = Number.parseFloat(dashboardCarouselLayout.trackGap);
  const selectedOffset = selectedIndex * (cardWidth + trackGap);

  return `calc(50% - ${cardWidth / 2}px - ${selectedOffset}px)`;
}

function getSkeletonDelayStyle(index: number): CSSProperties {
  return {
    '--dashboard-skeleton-delay': `-${index * SKELETON_PHASE_STEP_MS}ms`,
  } as CSSProperties;
}

function SkeletonSideActions() {
  return (
    <div
      className="absolute z-20 flex translate-x-1/2 -translate-y-1/2 flex-col"
      style={{
        top: dashboardCarouselLayout.actionTop,
        right: dashboardCarouselLayout.actionRight,
        gap: dashboardCarouselLayout.sideActionGap,
      }}
    >
      <div
        className="dashboard-skeleton-action-surface rounded-lg border border-white/45 bg-white/72"
        style={{
          width: dashboardCarouselLayout.sideActionSize,
          height: dashboardCarouselLayout.sideActionSize,
          boxShadow:
            '0 14px 32px -22px rgb(15 23 42 / 55%), inset 0 1px 0 rgb(255 255 255 / 70%)',
        }}
      />
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div
      className="absolute left-0 top-0 flex items-center justify-between rounded-t-lg bg-white px-3"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
      }}
    >
      <div className="dashboard-skeleton-line h-2.5 w-18 rounded-full" />
      <div className="flex h-7 w-[72px] items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-[1px]">
        <div className="h-6 w-6 -translate-y-px rounded-full bg-[#E2E8F0] shadow-[1px_2px_3px_rgb(15_23_42_/_18%),inset_0_1px_0_rgb(255_255_255_/_80%)]" />
      </div>
    </div>
  );
}

function SkeletonPosterContent() {
  return (
    <div className="dashboard-skeleton-media absolute inset-x-5 top-6 h-[280px] rounded-[18px]" />
  );
}

function SkeletonCenterActions() {
  return (
    <>
      <div className="absolute inset-0 z-[5] bg-black/10" />
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
        style={{
          gap: dashboardCarouselLayout.centerActionGap,
          paddingBottom: dashboardCarouselLayout.centerActionBottomPadding,
        }}
      >
        <div
          className="dashboard-skeleton-action-surface rounded-lg border border-white/35"
          style={{
            width: dashboardCarouselLayout.primaryActionWidth,
            height: dashboardCarouselLayout.primaryActionHeight,
          }}
        />
        <div
          className="dashboard-skeleton-action-surface rounded-lg border border-white/35 opacity-[0.85]"
          style={{
            width: dashboardCarouselLayout.primaryActionWidth,
            height: dashboardCarouselLayout.primaryActionHeight,
          }}
        />
        <div
          className="dashboard-skeleton-action-surface rounded-lg border border-white/35 opacity-[0.75]"
          style={{
            width: dashboardCarouselLayout.primaryActionWidth,
            height: dashboardCarouselLayout.primaryActionHeight,
          }}
        />
      </div>
    </>
  );
}

function SkeletonArtwork({
  index,
  isSelected,
}: Pick<SkeletonSlideProps, 'index' | 'isSelected'>) {
  return (
    <div
      className={`dashboard-skeleton-card absolute bottom-0 left-0 overflow-hidden border border-white/35 ${
        isSelected ? 'rounded-b-xl' : 'rounded-xl'
      }`}
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.cardHeight,
        ...getSkeletonDelayStyle(index),
      }}
    >
      <SkeletonPosterContent />
      {isSelected && <SkeletonCenterActions />}
    </div>
  );
}

function SkeletonSlide({
  index,
  isSelected,
  selectedLift,
}: SkeletonSlideProps) {
  return (
    <div
      className={`relative shrink-0 overflow-visible transition-transform ${
        isSelected ? 'z-10' : ''
      }`}
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.cardHeight,
        transform: isSelected
          ? `translateY(calc(-1 * ${selectedLift}))`
          : undefined,
      }}
    >
      {isSelected && <SkeletonSideActions />}

      <div
        className={`overflow-hidden rounded-xl ${
          isSelected ? 'relative' : 'absolute bottom-0 left-0'
        }`}
        style={{
          width: dashboardCarouselLayout.cardWidth,
          height: isSelected
            ? dashboardCarouselLayout.selectedVisualHeight
            : dashboardCarouselLayout.cardHeight,
          boxShadow:
            '0 28px 70px -46px rgb(15 23 42 / 70%), 0 10px 30px -24px rgb(15 23 42 / 48%)',
          ...getSkeletonDelayStyle(index),
        }}
      >
        {isSelected && <SkeletonHeader />}
        <SkeletonArtwork index={index} isSelected={isSelected} />
      </div>
    </div>
  );
}

function SkeletonController() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10">
      <div
        className="flex w-full items-center justify-center gap-6 border border-white/45 bg-white/35 shadow-[0_-18px_50px_-42px_rgb(15_23_42_/_65%)] backdrop-blur-xl"
        style={{ height: dashboardCarouselLayout.controllerHeight }}
      >
        <div className="dashboard-skeleton-action-surface flex size-11 items-center justify-center rounded-full border border-white/45">
          <ChevronLeft strokeWidth={3} className="size-6 text-[#64748B]/55" />
        </div>
        <div className="dashboard-skeleton-action-surface flex size-11 items-center justify-center rounded-full border border-white/45">
          <ChevronRight strokeWidth={3} className="size-6 text-[#64748B]/55" />
        </div>
      </div>
    </div>
  );
}

function DashboardCarouselSkeleton({
  count = DEFAULT_SKELETON_COUNT,
  stageHeight = dashboardCarouselLayout.dashboardStageHeight,
}: DashboardCarouselSkeletonProps) {
  const selectedIndex = Math.max(count - 1, 0);
  const selectedLift = `calc(${dashboardCarouselLayout.dashboardSelectedLift} + ${dashboardCarouselLayout.headerHeight})`;

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: stageHeight, minWidth: DESKTOP_CONTENT_MIN_WIDTH }}
      aria-hidden="true"
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
          className="relative flex h-full w-max min-w-full"
          style={{
            gap: dashboardCarouselLayout.trackGap,
            left: getSelectedTrackLeft(selectedIndex),
            top: 'calc(var(--carousel-base-offset) - var(--carousel-safe-top))',
          }}
        >
          {Array.from({ length: count }).map((_, index) => (
            <SkeletonSlide
              key={index}
              index={index}
              isSelected={index === selectedIndex}
              selectedLift={selectedLift}
            />
          ))}
        </div>
      </div>

      <SkeletonController />
    </section>
  );
}

export default DashboardCarouselSkeleton;
