'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';
import { InviteListItem } from '@/app/dashboard/types';

import { dashboardCarouselLayout } from './carouselLayout';
import CarouselTrack from './CarouselTrack';
import CarouselController from './controller/CarouselController';

type CarouselWrapperProps = {
  initialInvites?: InviteListItem[];
};

function CarouselWrapper({ initialInvites = [] }: CarouselWrapperProps) {
  const {
    invites,
    handleUpdate,
    handlePublish,
    handleCopyPublishedUrl,
    getPublishedUrl,
    isPublishing,
  } = useDashboardInvitations(initialInvites);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    duration: 40,
    loop: false,
    slidesToScroll: 1,
    startIndex: 0,
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

    if (invites.length === 0) {
      return;
    }

    const lastIndex = invites.length - 1;
    emblaApi.scrollTo(lastIndex, true);
  }, [emblaApi, invites.length]);

  const handleSelect = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const handleMove = useCallback(
    (direction: 'left' | 'right') => {
      if (invites.length === 0) return;

      const delta = direction === 'left' ? -1 : 1;
      const nextIndex = Math.max(
        0,
        Math.min(selectedIndex + delta, invites.length - 1)
      );

      emblaApi?.scrollTo(nextIndex);
    },
    [emblaApi, invites.length, selectedIndex]
  );

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: dashboardCarouselLayout.stageHeight }}
    >
      <CarouselTrack
        emblaRef={emblaRef}
        invites={invites}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        onUpdate={handleUpdate}
        onPublish={handlePublish}
        onCopyUrl={handleCopyPublishedUrl}
        getPublishedUrl={getPublishedUrl}
        isPublishing={isPublishing}
      />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <CarouselController onMove={handleMove} />
      </div>
    </section>
  );
}
export default CarouselWrapper;
