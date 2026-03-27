'use client';

import useEmblaCarousel from 'embla-carousel-react';

import { DASHBOARD_CAROUSEL_START_GUTTER_PX } from '@/app/dashboard/dashboardConfig';

import useDashboardInvitations from '../hooks/useDashboardInvitations';

import DashboardCarouselControls from './DashboardCarouselControls';
import DashboardTitle from './DashboardTitle';
import InvitationSection from './InvitationSection';

function DashboardContent() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: () => DASHBOARD_CAROUSEL_START_GUTTER_PX,
    direction: 'rtl',
    loop: true,
    slidesToScroll: 1,
  });
  const {
    invites,
    loading,
    error,
    handlePublish,
    handleUpdate,
    handleCopyPublishedUrl,
    getPublishedUrl,
    isPublishing,
  } = useDashboardInvitations();

  return (
    <section className="relative flex h-full min-h-0 flex-col justify-end overflow-y-hidden">
      <DashboardTitle />
      <InvitationSection
        emblaRef={emblaRef}
        invites={invites}
        loading={loading}
        error={error}
        onPublish={handlePublish}
        onEdit={handleUpdate}
        onCopyUrl={handleCopyPublishedUrl}
        getPublishedUrl={getPublishedUrl}
        isPublishing={isPublishing}
      />

      <DashboardCarouselControls
        onLeftClick={() => emblaApi?.scrollNext()}
        onRightClick={() => emblaApi?.scrollPrev()}
      />
    </section>
  );
}

export default DashboardContent;
