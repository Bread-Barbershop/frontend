import { dashboardCarouselLayout, dashboardCarouselVars } from './carouselLayout';
import { CarouselCardItem } from './carouselTypes';
import CarouselItem from './item/CarouselItem';

type CarouselTrackProps = {
  emblaRef: (instance: HTMLDivElement | null) => void;
  items: CarouselCardItem[];
  isReady: boolean;
  selectedIndex: number;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  selectedLift?: string;
  onSelect: (index: number) => void;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onPublish?: (folderId: string) => void;
  onCopyUrl?: (folderId: string) => void;
  onShare?: (folderId: string) => Promise<void>;
  getPublishedUrl?: (folderId: string) => string | null;
  isSharing?: (folderId: string) => boolean;
  isPublishing?: (folderId: string) => boolean;
};

function CarouselTrack({
  emblaRef,
  items,
  isReady,
  selectedIndex,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  selectedLift,
  onSelect,
  onUpdate,
  onPublish,
  onCopyUrl,
  onShare,
  getPublishedUrl,
  isSharing,
  isPublishing,
}: CarouselTrackProps) {
  return (
    <div
      ref={emblaRef}
      className={`h-full w-full overflow-hidden ${
        isReady ? 'opacity-100' : 'opacity-0'
      }`}
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
        {items.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={index}
            isSelected={selectedIndex === index}
            showHeader={showHeader}
            showSideActions={showSideActions}
            showCenterActions={showCenterActions}
            selectedLift={selectedLift}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onPublish={onPublish}
            onCopyUrl={onCopyUrl}
            onShare={onShare}
            publishedUrl={
              item.invite && getPublishedUrl
                ? getPublishedUrl(item.invite.folderId)
                : null
            }
            isSharing={
              item.invite && isSharing ? isSharing(item.invite.folderId) : false
            }
            isPublishing={
              item.invite && isPublishing
                ? isPublishing(item.invite.folderId)
                : false
            }
          />
        ))}
      </div>
    </div>
  );
}
export default CarouselTrack;
