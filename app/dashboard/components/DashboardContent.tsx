'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

import useDashboardInvitations from '../hooks/useDashboardInvitations';

import DashboardCarouselControls from './DashboardCarouselControls';
import DashboardTitle from './DashboardTitle';
import InvitationSection from './InvitationSection';

function DashboardContent() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: () => -20,
    direction: 'rtl',
    loop: true,
    slidesToScroll: 1,
  });
  const {
    invites,
    loading,
    error,
    handleDelete,
    handlePublish,
    handleUpdate,
    handleCopyPublishedUrl,
    getDeleteError,
    getPublishedUrl,
    getPublishError,
    isDeleting,
    isPublishing,
  } = useDashboardInvitations();

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.reInit();
  }, [emblaApi, invites.length]);

  return (
    <section className="relative flex h-full min-h-0 flex-col justify-end overflow-y-hidden">
      <DashboardTitle />
      <InvitationSection
        emblaRef={emblaRef}
        invites={invites}
        loading={loading}
        error={error}
        getDeleteError={getDeleteError}
        getPublishError={getPublishError}
        isDeleting={isDeleting}
        onDelete={handleDelete}
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
