import { InviteListItem } from '@/app/dashboard/types';

import { dashboardCarouselLayout, dashboardCarouselVars } from './carouselLayout';
import CarouselItem from './item/CarouselItem';

type CarouselTrackProps = {
  emblaRef: (instance: HTMLDivElement | null) => void;
  invites: InviteListItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onUpdate: (folderId: string, uuid?: string) => void;
  onPublish: (folderId: string) => void;
  onCopyUrl: (folderId: string) => void;
  getPublishedUrl: (folderId: string) => string | null;
  isPublishing: (folderId: string) => boolean;
};

function CarouselTrack({
  emblaRef,
  invites,
  selectedIndex,
  onSelect,
  onUpdate,
  onPublish,
  onCopyUrl,
  getPublishedUrl,
  isPublishing,
}: CarouselTrackProps) {
  return (
    <div
      ref={emblaRef}
      className="h-full w-full overflow-hidden"
      style={{
        ...dashboardCarouselVars,
        paddingTop: 'var(--carousel-safe-top)',
        paddingBottom: `calc(var(--carousel-safe-bottom) + ${dashboardCarouselLayout.controllerClearance})`,
      }}
    >
      <div
        className="relative flex h-full w-full min-w-full"
        style={{
          gap: dashboardCarouselLayout.trackGap,
          top: 'calc(var(--carousel-base-offset) - var(--carousel-safe-top))',
        }}
      >
        {invites.map((invite, index) => (
          <CarouselItem
            key={invite.folderId}
            invite={invite}
            index={index}
            isSelected={selectedIndex === index}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onPublish={onPublish}
            onCopyUrl={onCopyUrl}
            publishedUrl={getPublishedUrl(invite.folderId)}
            isPublishing={isPublishing(invite.folderId)}
          />
        ))}
      </div>
    </div>
  );
}
export default CarouselTrack;
