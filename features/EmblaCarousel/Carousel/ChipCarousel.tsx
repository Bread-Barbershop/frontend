import useEmblaCarousel from 'embla-carousel-react';
import React, { PointerEvent, useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/atoms/button';
import { cn } from '@/shared/utils/cn';

interface Props {
  items: { label: string; value: string }[];
  className?: string;
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
}

function ChipCarousel({ items, className, onPointerDown }: Props) {
  const [selectedValue, setSelectedValue] = useState(items[0].value);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncScrollState = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    syncScrollState();

    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className={cn('min-w-0 flex-1', className)}>
      <div className="flex items-center relative">
        <div
          className={`w-11 h-11  absolute left-0 cursor-pointer  bg-bg-base ${canScrollPrev ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
        >
          <button
            className="w-full h-full flex-center"
            onClick={e => {
              e.stopPropagation();
              scrollPrev();
            }}
            aria-label="이전"
          >
            <svg
              width="9"
              height="14"
              viewBox="0 0 9 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 13L1 7L8 1"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-1.5">
              {items.map(item => {
                return (
                  <div key={item.value} className="flex-auto">
                    <Button
                      key={item.value}
                      className={cn(
                        `w-[63px] font-normal ${selectedValue === item.value ? 'border-primary' : 'border-border-neutral'}`,
                        className
                      )}
                      value={item.value}
                      onPointerDown={e => {
                        if (onPointerDown) {
                          onPointerDown(e);
                        }
                        setSelectedValue(item.value);
                      }}
                    >
                      {item.value}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`w-11 h-11 absolute right-0 cursor-pointer bg-bg-base ${canScrollNext ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
        >
          <button
            className="w-full h-full flex-center"
            onClick={e => {
              e.stopPropagation();
              scrollNext();
            }}
            aria-label="다음"
          >
            <svg
              width="9"
              height="14"
              viewBox="0 0 9 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L8 7L0.999999 13"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChipCarousel;
