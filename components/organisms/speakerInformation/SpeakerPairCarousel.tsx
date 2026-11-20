import { useRef, useState } from 'react';

import NextButton from '@/features/EmblaCarousel/CarouselButton/NextButton';
import PrevButton from '@/features/EmblaCarousel/CarouselButton/PrevButton';

import type { ReactNode } from 'react';

export function SpeakerPairCarousel({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const scrollToPage = (nextPage: 1 | 2) => {
    const element = viewport.current;
    if (element) element.scrollTo({ left: (nextPage - 1) * element.clientWidth });
  };

  return (
    <div className="w-full min-w-0" data-no-block-drag>
      <div
        ref={viewport}
        role="region"
        aria-label="연사 카드"
        className="flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-hide motion-safe:scroll-smooth"
        onScroll={({ currentTarget }) => {
          setPage(currentTarget.scrollLeft > currentTarget.clientWidth / 2 ? 2 : 1);
        }}
      >
        {children}
      </div>
      <div
        role="group"
        aria-label="연사 이동"
        className="mt-4 flex items-center justify-center gap-3"
      >
        <PrevButton disabled={page === 1} onClick={() => scrollToPage(1)} />
        <span role="status" aria-atomic="true" className="text-sm tabular-nums">
          {page} / 2
        </span>
        <NextButton disabled={page === 2} onClick={() => scrollToPage(2)} />
      </div>
    </div>
  );
}
