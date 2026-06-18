import {
  dashboardCarouselLayout,
  dashboardCarouselVars,
} from './carouselLayout';
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
  preloadItemCount?: number;
  onSelect: (index: number) => void;
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

function CarouselTrack({
  emblaRef,
  items,
  isReady,
  selectedIndex,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  selectedLift,
  preloadItemCount = 0,
  onSelect,
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
            preloadImage={index < preloadItemCount}
            onSelect={onSelect}
            onDelete={onDelete}
            onPreview={onPreview}
            onUpdate={onUpdate}
            onToggleVisibility={onToggleVisibility}
            onCopyUrl={onCopyUrl}
            onShare={onShare}
            guestUrl={
              item.invite && getGuestUrl
                ? getGuestUrl(item.invite.folderId)
                : null
            }
            isDeleting={
              item.invite && isDeleting
                ? isDeleting(item.invite.folderId)
                : false
            }
            isSharing={
              item.invite && isSharing ? isSharing(item.invite.folderId) : false
            }
            isVisibilityUpdating={
              item.invite && isVisibilityUpdating
                ? isVisibilityUpdating(item.invite.folderId)
                : false
            }
            visibilityError={
              item.invite && getVisibilityError
                ? getVisibilityError(item.invite.folderId)
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}
export default CarouselTrack;
