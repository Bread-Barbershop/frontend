'use client';

import { useMemo } from 'react';

import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';
import { InviteListItem } from '@/app/dashboard/types';
import { getInvitationShowcaseItem } from '@/app/dashboard/utils/getInvitationShowcaseItem';

import CarouselBase from './CarouselBase';
import { dashboardCarouselLayout } from './carouselLayout';
import { CarouselCardItem } from './carouselTypes';

type CarouselWrapperProps = {
  initialInvites?: InviteListItem[];
};

function CarouselWrapper({ initialInvites = [] }: CarouselWrapperProps) {
  const {
    invites,
    handleUpdate,
    handlePublish,
    handleCopyPublishedUrl,
    handleShare,
    getPublishedUrl,
    isSharing,
    isPublishing,
  } = useDashboardInvitations(initialInvites);
  const items: CarouselCardItem[] = useMemo(
    () =>
      invites.map(invite => {
        const showcaseItem = getInvitationShowcaseItem(invite.folderId);

        return {
          id: invite.folderId,
          image: showcaseItem.image,
          alt: showcaseItem.alt,
          invite,
        };
      }),
    [invites]
  );

  return (
    <CarouselBase
      items={items}
      startIndex={Math.max(invites.length - 1, 0)}
      stageHeight={dashboardCarouselLayout.dashboardStageHeight}
      selectedLift={dashboardCarouselLayout.dashboardSelectedLift}
      showHeader
      showSideActions
      showCenterActions
      onUpdate={handleUpdate}
      onPublish={handlePublish}
      onCopyUrl={handleCopyPublishedUrl}
      onShare={handleShare}
      getPublishedUrl={getPublishedUrl}
      isSharing={isSharing}
      isPublishing={isPublishing}
    />
  );
}
export default CarouselWrapper;
