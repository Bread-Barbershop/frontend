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
const SELECTED_SKELETON_EXTRA_LIFT = '1.5rem';
const SKELETON_DELAY_STEP_MS = 120;

function getSelectedTrackLeft(selectedIndex: number) {
  const cardWidth = Number.parseFloat(dashboardCarouselLayout.cardWidth);
  const trackGap = Number.parseFloat(dashboardCarouselLayout.trackGap);
  const selectedOffset = selectedIndex * (cardWidth + trackGap);

  return `calc(50% - ${cardWidth / 2}px - ${selectedOffset}px)`;
}

function getSkeletonDelayStyle(index: number): CSSProperties {
  return {
    '--dashboard-skeleton-delay': `${index * SKELETON_DELAY_STEP_MS}ms`,
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
        className="rounded-lg bg-white/55"
        style={{
          width: dashboardCarouselLayout.sideActionSize,
          height: dashboardCarouselLayout.sideActionSize,
          boxShadow: dashboardCarouselLayout.sideActionShadow,
        }}
      />
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div
      className="absolute left-0 top-0 flex items-center justify-between rounded-t-lg bg-white px-2"
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.headerHeight,
      }}
    >
      <div className="h-2.5 w-18 rounded-full bg-white/45" />
      <div className="h-2.5 w-20 rounded-full bg-white/38" />
    </div>
  );
}

function SkeletonInvitationDetails() {
  return (
    <>
      <div className="absolute inset-x-8 top-12 h-2.5 rounded-full bg-white/24" />
      <div className="absolute left-1/2 top-20 h-9 w-24 -translate-x-1/2 rounded-full bg-white/18" />
      <div className="absolute inset-x-9 top-[138px] h-2 rounded-full bg-white/18" />
      <div className="absolute inset-x-14 top-40 h-2 rounded-full bg-white/14" />
      <div className="absolute inset-x-10 bottom-12 h-2.5 rounded-full bg-white/18" />
      <div className="absolute inset-x-16 bottom-7 h-2 rounded-full bg-white/14" />
    </>
  );
}

function SkeletonCenterActions() {
  return (
    <>
      <div className="absolute inset-0 z-[5] bg-black/8" />
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
        style={{
          gap: dashboardCarouselLayout.centerActionGap,
          paddingBottom: dashboardCarouselLayout.centerActionBottomPadding,
        }}
      >
        <div
          className="rounded-lg bg-[#FAE100]/58"
          style={{
            width: dashboardCarouselLayout.primaryActionWidth,
            height: dashboardCarouselLayout.primaryActionHeight,
          }}
        />
        <div
          className="rounded-lg bg-white/58"
          style={{
            width: dashboardCarouselLayout.primaryActionWidth,
            height: dashboardCarouselLayout.primaryActionHeight,
          }}
        />
        <div
          className="rounded-lg bg-white/58"
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
      className={`dashboard-skeleton-card absolute bottom-0 left-0 overflow-hidden ${
        isSelected ? 'rounded-b-xl' : 'rounded-xl'
      }`}
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.cardHeight,
        ...getSkeletonDelayStyle(index),
      }}
    >
      <div className="dashboard-skeleton-shimmer" />
      <SkeletonInvitationDetails />
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
          boxShadow: dashboardCarouselLayout.sideActionShadow,
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
        className="flex w-full items-center justify-center gap-6 border border-white/30 bg-white/10 backdrop-blur-md"
        style={{ height: dashboardCarouselLayout.controllerHeight }}
      >
        <div className="flex size-11 items-center justify-center rounded-full bg-[#EEEEF2]/80">
          <ChevronLeft strokeWidth={3} className="size-6 text-[#6B7280]/60" />
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-[#EEEEF2]/80">
          <ChevronRight strokeWidth={3} className="size-6 text-[#6B7280]/60" />
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
  const selectedLift = `calc(${dashboardCarouselLayout.dashboardSelectedLift} + ${SELECTED_SKELETON_EXTRA_LIFT})`;

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
