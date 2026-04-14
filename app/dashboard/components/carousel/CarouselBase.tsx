'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import { dashboardCarouselLayout } from './carouselLayout';
import CarouselTrack from './CarouselTrack';
import { CarouselCardItem } from './carouselTypes';
import CarouselController from './controller/CarouselController';

type CarouselBaseProps = {
  items: CarouselCardItem[];
  startIndex?: number;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onPublish?: (folderId: string) => void;
  onCopyUrl?: (folderId: string) => void;
  getPublishedUrl?: (folderId: string) => string | null;
  isPublishing?: (folderId: string) => boolean;
};

function CarouselBase({
  items,
  startIndex = 0,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  onUpdate,
  onPublish,
  onCopyUrl,
  getPublishedUrl,
  isPublishing,
}: CarouselBaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    duration: 40,
    loop: false,
    slidesToScroll: 1,
    startIndex,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const syncSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', syncSelectedIndex);
    emblaApi.on('reInit', syncSelectedIndex);

    return () => {
      emblaApi.off('select', syncSelectedIndex);
      emblaApi.off('reInit', syncSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.reInit();

    if (items.length === 0) {
      return;
    }

    const clampedStartIndex = Math.max(
      0,
      Math.min(startIndex, items.length - 1)
    );
    emblaApi.scrollTo(clampedStartIndex, true);
  }, [emblaApi, items.length, startIndex]);

  const handleSelect = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const handleMove = useCallback(
    (direction: 'left' | 'right') => {
      if (items.length === 0) return;

      const delta = direction === 'left' ? -1 : 1;
      const nextIndex = Math.max(
        0,
        Math.min(selectedIndex + delta, items.length - 1)
      );

      emblaApi?.scrollTo(nextIndex);
    },
    [emblaApi, items.length, selectedIndex]
  );

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: dashboardCarouselLayout.stageHeight }}
    >
      <CarouselTrack
        emblaRef={emblaRef}
        items={items}
        selectedIndex={selectedIndex}
        showHeader={showHeader}
        showSideActions={showSideActions}
        showCenterActions={showCenterActions}
        onSelect={handleSelect}
        onUpdate={onUpdate}
        onPublish={onPublish}
        onCopyUrl={onCopyUrl}
        getPublishedUrl={getPublishedUrl}
        isPublishing={isPublishing}
      />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <CarouselController onMove={handleMove} />
      </div>
    </section>
  );
}

export default CarouselBase;
