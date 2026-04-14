import Image from 'next/image';
import { KeyboardEvent, MouseEvent, useState } from 'react';

import { dashboardCarouselLayout } from '../carouselLayout';
import { CarouselCardItem } from '../carouselTypes';

import DeleteButton from './actions/DeleteButton';
import PublishButton from './actions/PublishButton';
import PublishedUrlActions from './actions/PublishedUrlActions';
import ReEditButton from './actions/ReEditButton';
import ShareButton from './actions/ShareButton';
import ItemHeader from './ItemHeader';

type CarouselItemProps = {
  item: CarouselCardItem;
  index: number;
  isSelected: boolean;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  onSelect: (index: number) => void;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onPublish?: (folderId: string) => void;
  onCopyUrl?: (folderId: string) => void;
  publishedUrl: string | null;
  isPublishing: boolean;
};

function CarouselItem({
  item,
  index,
  isSelected,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  onSelect,
  onUpdate,
  onPublish,
  onCopyUrl,
  publishedUrl,
  isPublishing,
}: CarouselItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const invite = item.invite;
  const showSelectedOverlay = showHeader || showSideActions || showCenterActions;
  const hoverLift = showHeader
    ? `calc(${dashboardCarouselLayout.selectedLift} - ${dashboardCarouselLayout.headerHeight})`
    : dashboardCarouselLayout.selectedLift;
  const translateY = isSelected
    ? dashboardCarouselLayout.selectedLift
    : isHovered
      ? hoverLift
      : null;

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(index)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={item.invite?.name ?? item.alt}
      aria-pressed={isSelected}
      className={`group relative shrink-0 overflow-visible cursor-pointer text-left ${
        isSelected ? 'z-10' : 'hover:z-10'
      }`}
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.cardHeight,
      }}
    >
      <div
        className="relative overflow-visible transition-transform"
        style={{
          transitionDuration: `${dashboardCarouselLayout.cardLiftDurationMs}ms`,
          transform: translateY ? `translateY(calc(-1 * ${translateY}))` : undefined,
          height:
            isSelected && showHeader
              ? dashboardCarouselLayout.selectedVisualHeight
              : dashboardCarouselLayout.cardHeight,
        }}
      >
        {isSelected && showSideActions && invite && (
          <div
            className="absolute z-20 flex translate-x-1/2 -translate-y-1/2 flex-col"
            style={{
              top: dashboardCarouselLayout.actionTop,
              right: dashboardCarouselLayout.actionRight,
              gap: dashboardCarouselLayout.sideActionGap,
            }}
          >
            <button
              type="button"
              onClick={handleActionClick}
              className="cursor-pointer"
            >
              <DeleteButton />
            </button>
            <button
              type="button"
              onClick={handleActionClick}
              className="cursor-pointer"
            >
              <ShareButton />
            </button>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 z-10 rounded-xl"
          style={{
            width: dashboardCarouselLayout.cardWidth,
            height:
              isSelected && showHeader
                ? dashboardCarouselLayout.selectedVisualHeight
                : dashboardCarouselLayout.cardHeight,
            boxShadow:
              '0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.08)',
          }}
        >
          {isSelected && showHeader && (
            <div className="absolute top-0 left-0 z-10">
              <ItemHeader
                createdTime={invite?.createdTime}
                isPublished={Boolean(publishedUrl)}
              />
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 overflow-hidden ${
              isSelected && showHeader ? 'rounded-b-xl' : 'rounded-xl'
            }`}
            style={{
              width: dashboardCarouselLayout.cardWidth,
              height: dashboardCarouselLayout.cardHeight,
            }}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="260px"
              className="object-cover"
            />
            <div
              className={`absolute inset-0 bg-black/8 transition-opacity duration-300 ${
                isSelected && showSelectedOverlay ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {isSelected && showCenterActions && invite && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                style={{ gap: dashboardCarouselLayout.centerActionGap }}
              >
                {publishedUrl && (
                  <PublishedUrlActions
                    publishedUrl={publishedUrl}
                    onCopy={() => onCopyUrl?.(invite.folderId)}
                  />
                )}
                <PublishButton
                  isPublished={Boolean(publishedUrl)}
                  isPublishing={isPublishing}
                  onPublish={() => onPublish?.(invite.folderId)}
                />
                <button
                  type="button"
                  onClick={event => {
                    handleActionClick(event);
                    onUpdate?.(invite.folderId, invite.invitationUuid);
                  }}
                  className="cursor-pointer"
                >
                  <ReEditButton />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CarouselItem;
