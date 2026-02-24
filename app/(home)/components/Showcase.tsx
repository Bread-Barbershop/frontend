'use client';

import {
  motion,
  useMotionValue,
  useAnimationFrame,
  animate,
  wrap,
} from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const showcaseList = [
  { item: '1' },
  { item: '2' },
  { item: '3' },
  { item: '4' },
  { item: '5' },
  { item: '6' },
  { item: '7' },
  { item: '8' },
  { item: '9' },
  { item: '10' },
  { item: '11' },
  { item: '12' },
];

function Showcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  const x = useMotionValue(0);
  const speed = 0.3;

  const ITEM_WIDTH = 260;
  const GAP = 40;
  const STEP = ITEM_WIDTH + GAP;

  const getWrappedX = (value: number) => {
    const track = trackRef.current;
    if (!track) return value;

    const oneSetWidth = track.scrollWidth / 3;
    return wrap(-oneSetWidth, 0, value);
  };

  useAnimationFrame(() => {
    if (isPaused.current) return;

    const track = trackRef.current;
    if (!track) return;

    let current = x.get();
    current -= speed;

    x.set(getWrappedX(current));
  });

  const slide = (direction: 'left' | 'right') => {
    isPaused.current = true;

    const current = x.get();
    const next = direction === 'right' ? current - STEP : current + STEP;

    animate(x, next, {
      type: 'spring',
      stiffness: 120,
      damping: 20,
      onUpdate: latest => {
        x.set(getWrappedX(latest));
      },
      onComplete: () => {
        isPaused.current = false;
      },
    });
  };

  return (
    <section className="h-134.75 w-full relative flex flex-col justify-between items-center">
      <div className="w-full h-118.75 overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-10 w-max h-118.75"
          style={{ x }}
          onMouseEnter={() => (isPaused.current = true)}
          onMouseLeave={() => (isPaused.current = false)}
        >
          {[...showcaseList, ...showcaseList, ...showcaseList].map(
            (item, index) => (
              <div
                key={index}
                className="w-65 min-w-65 h-full border shadow-[0px_8px_24px_rgba(0,0,0,0.08),0px_2px_10px_rgba(0,0,0,0.12)] bg-white"
              >
                {item.item}
              </div>
            )
          )}
        </motion.div>
      </div>

      <div className="flex gap-6">
        <button
          className="flex justify-center items-center size-11 bg-[#EEEEF2] rounded-full cursor-pointer  hover:bg-[#E4E4E4] hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
          onClick={() => slide('left')}
        >
          <ChevronLeft
            className="text-[#6B7280] -translate-x-px"
            strokeWidth={3}
          />
        </button>

        <button
          className="flex justify-center items-center size-11 bg-[#EEEEF2] rounded-full cursor-pointer  hover:bg-[#E4E4E4] hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
          onClick={() => slide('right')}
        >
          <ChevronRight
            className="text-[#6B7280] translate-x-px"
            strokeWidth={3}
          />
        </button>
      </div>
    </section>
  );
}

export default Showcase;
