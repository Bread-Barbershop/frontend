'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

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
  stageHeight?: string;
  selectedLift?: string;
  preloadItemCount?: number;
  onDelete?: (folderId: string) => void | Promise<void>;
  onPreview?: (folderId: string) => void;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onToggleVisibility?: (
    folderId: string,
    nextVisible: boolean
  ) => void | Promise<void>;
  onCopyUrl?: (folderId: string) => void;
  onShare?: (folderId: string) => Promise<void>;
  getGuestUrl?: (folderId: string) => string | null;
  isDeleting?: (folderId: string) => boolean;
  isSharing?: (folderId: string) => boolean;
  isVisibilityUpdating?: (folderId: string) => boolean;
  getVisibilityError?: (folderId: string) => string | null;
};

function CarouselBase({
  items,
  startIndex = 0,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  stageHeight = dashboardCarouselLayout.stageHeight,
  selectedLift,
  preloadItemCount = 0,
  onDelete,
  onPreview,
  onUpdate,
  onToggleVisibility,
  onCopyUrl,
  onShare,
  getGuestUrl,
  isDeleting,
  isSharing,
  isVisibilityUpdating,
  getVisibilityError,
}: CarouselBaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(startIndex);
  const hasHandledInitialLayoutRef = useRef(false);
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

    syncSelectedIndex();
    emblaApi.on('select', syncSelectedIndex);
    emblaApi.on('reInit', syncSelectedIndex);

    return () => {
      emblaApi.off('select', syncSelectedIndex);
      emblaApi.off('reInit', syncSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    if (!hasHandledInitialLayoutRef.current) {
      hasHandledInitialLayoutRef.current = true;
      return;
    }

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
      if (!emblaApi || items.length === 0) return;

      const currentIndex = emblaApi.selectedScrollSnap();
      const delta = direction === 'left' ? -1 : 1;
      const nextIndex = Math.max(
        0,
        Math.min(currentIndex + delta, items.length - 1)
      );

      emblaApi?.scrollTo(nextIndex);
    },
    [emblaApi, items.length]
  );

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: stageHeight, minWidth: DESKTOP_CONTENT_MIN_WIDTH }}
    >
      <CarouselTrack
        emblaRef={emblaRef}
        items={items}
        isReady={Boolean(emblaApi)}
        selectedIndex={selectedIndex}
        showHeader={showHeader}
        showSideActions={showSideActions}
        showCenterActions={showCenterActions}
        selectedLift={selectedLift}
        preloadItemCount={preloadItemCount}
        onSelect={handleSelect}
        onDelete={onDelete}
        onPreview={onPreview}
        onUpdate={onUpdate}
        onToggleVisibility={onToggleVisibility}
        onCopyUrl={onCopyUrl}
        onShare={onShare}
        getGuestUrl={getGuestUrl}
        isDeleting={isDeleting}
        isSharing={isSharing}
        isVisibilityUpdating={isVisibilityUpdating}
        getVisibilityError={getVisibilityError}
      />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <CarouselController onMove={handleMove} />
      </div>
    </section>
  );
}

export default CarouselBase;
