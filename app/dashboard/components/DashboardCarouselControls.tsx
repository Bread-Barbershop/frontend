'use client';

import { DASHBOARD_CAROUSEL_CONTROLS_CONTAINER_CLASS } from '@/app/dashboard/dashboardConfig';

import CarouselControlButton from './CarouselControlButton';

type DashboardCarouselControlsProps = {
  onLeftClick: () => void;
  onRightClick: () => void;
};

function DashboardCarouselControls({
  onLeftClick,
  onRightClick,
}: DashboardCarouselControlsProps) {
  return (
    <div className={DASHBOARD_CAROUSEL_CONTROLS_CONTAINER_CLASS}>
      <div className="flex items-center gap-3">
        <CarouselControlButton
          direction="left"
          onClick={onLeftClick}
          className="cursor-pointer bg-[#eeeef2] hover:bg-white hover:text-black"
        />
        <CarouselControlButton
          direction="right"
          onClick={onRightClick}
          className="cursor-pointer bg-[#eeeef2] hover:bg-white hover:text-black"
        />
      </div>
    </div>
  );
}

export default DashboardCarouselControls;
