'use client';

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
    <div className="absolute bottom-0 left-1/2 z-20 flex h-[68px] w-screen -translate-x-1/2 items-center justify-center border-t border-white/30 bg-white/10 px-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md supports-backdrop-filter:bg-white/10">
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
