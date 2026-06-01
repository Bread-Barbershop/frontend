'use client';

import { useMemo } from 'react';

import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';
import { InviteListItem } from '@/app/dashboard/types';
import { getInvitationShowcaseItem } from '@/app/dashboard/utils/getInvitationShowcaseItem';

import CarouselBase from './CarouselBase';
import { dashboardCarouselLayout } from './carouselLayout';
import { CarouselCardItem } from './carouselTypes';
import DashboardCarouselSkeleton from './DashboardCarouselSkeleton';
import EmptyInvitationCard from './EmptyInvitationCard';

type CarouselWrapperProps = {
  initialInvites?: InviteListItem[];
  loadOnMount?: boolean;
};

function CarouselWrapper({
  initialInvites = [],
  loadOnMount,
}: CarouselWrapperProps) {
  const {
    invites,
    loading,
    handleDelete,
    handleUpdate,
    handlePublish,
    handleCopyPublishedUrl,
    handleShare,
    getPublishedUrl,
    isDeleting,
    isSharing,
    isPublishing,
    isPublishReadinessPolling,
    isPublishReadyPending,
  } = useDashboardInvitations(initialInvites, { loadOnMount });
  const orderedInvites = useMemo(() => [...invites].reverse(), [invites]);
  const items: CarouselCardItem[] = useMemo(
    () =>
      orderedInvites.map(invite => {
        const showcaseItem = getInvitationShowcaseItem(invite.folderId);

        return {
          id: invite.folderId,
          image:
            invite.thumbnailUrl && invite.thumbnailUrl !== ''
              ? invite.thumbnailUrl
              : showcaseItem.image,
          alt: showcaseItem.alt,
          invite,
        };
      }),
    [orderedInvites]
  );

  if (loading) {
    return <DashboardCarouselSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyInvitationCard />;
  }

  return (
    <CarouselBase
      items={items}
      startIndex={Math.max(orderedInvites.length - 1, 0)}
      stageHeight={dashboardCarouselLayout.dashboardStageHeight}
      selectedLift={dashboardCarouselLayout.dashboardSelectedLift}
      showHeader
      showSideActions
      showCenterActions
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      onPublish={handlePublish}
      onCopyUrl={handleCopyPublishedUrl}
      onShare={handleShare}
      getPublishedUrl={getPublishedUrl}
      isDeleting={isDeleting}
      isSharing={isSharing}
      isPublishing={isPublishing}
      isPublishReadinessPolling={isPublishReadinessPolling}
      isPublishReadyPending={isPublishReadyPending}
    />
  );
}
export default CarouselWrapper;
