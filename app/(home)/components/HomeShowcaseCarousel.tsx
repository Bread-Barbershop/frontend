'use client';

import CarouselBase from '@/app/dashboard/components/carousel/CarouselBase';
import { useShowcasePreview } from '@/features/showcase/components/ShowcasePreviewProvider';

import type { showcaseItems } from './showcaseItems';

export default function HomeShowcaseCarousel({
  items,
}: {
  items: typeof showcaseItems;
}) {
  const openPreview = useShowcasePreview();
  return (
    <CarouselBase
      items={items}
      startIndex={0}
      preloadItemCount={5}
      onCardActivate={openPreview}
    />
  );
}
