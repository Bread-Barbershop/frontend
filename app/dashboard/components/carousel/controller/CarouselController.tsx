import { dashboardCarouselLayout } from '../carouselLayout';

import ControlButton from './ControlButton';

type CarouselControllerProps = {
  onMove: (direction: 'left' | 'right') => void;
};

function CarouselController({ onMove }: CarouselControllerProps) {
  return (
    <div
      className="flex w-full items-center justify-center gap-6 border border-white/30 bg-white/10 backdrop-blur-md"
      style={{ height: dashboardCarouselLayout.controllerHeight }}
    >
      <ControlButton type="left" onClick={() => onMove('left')} />
      <ControlButton type="right" onClick={() => onMove('right')} />
    </div>
  );
}
export default CarouselController;
