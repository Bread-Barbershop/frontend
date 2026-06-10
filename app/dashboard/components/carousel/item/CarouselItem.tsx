import Image from 'next/image';
import { KeyboardEvent, MouseEvent, useState } from 'react';

import EditIcon from '@/shared/assets/icons/edit.svg';
import KakaoIcon from '@/shared/assets/icons/kakao2.svg';
import LinkIcon from '@/shared/assets/icons/link.svg';

import { dashboardCarouselLayout } from '../carouselLayout';
import { CarouselCardItem } from '../carouselTypes';

import DashboardActionButton from './actions/DashboardActionButton';
import DeleteButton from './actions/DeleteButton';
import ItemHeader from './ItemHeader';

type CarouselItemProps = {
  item: CarouselCardItem;
  index: number;
  isSelected: boolean;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  selectedLift?: string;
  onSelect: (index: number) => void;
  onDelete?: (folderId: string) => void | Promise<void>;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onCopyUrl?: (folderId: string) => void;
  onShare?: (folderId: string) => Promise<void>;
  publishedUrl: string | null;
  isDeleting: boolean;
  isSharing: boolean;
};

function CarouselItem({
  item,
  index,
  isSelected,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  selectedLift: selectedLiftProp = dashboardCarouselLayout.selectedLift,
  onSelect,
  onDelete,
  onUpdate,
  onCopyUrl,
  onShare,
  publishedUrl,
  isDeleting,
  isSharing,
}: CarouselItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUrlActionExpanded, setIsUrlActionExpanded] = useState(false);
  const invite = item.invite;
  const canShare = Boolean(invite?.hasKakaoShareData);
  const showSelectedOverlay =
    showHeader || showSideActions || showCenterActions;
  const hoverLift = showHeader
    ? `calc(${selectedLiftProp} - ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const selectedLift = showHeader
    ? `calc(${selectedLiftProp} + ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const translateY = isSelected ? selectedLift : isHovered ? hoverLift : null;

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
      className={`group relative shrink-0 overflow-visible cursor-pointer select-none text-left ${
        isSelected ? 'z-10' : 'hover:z-10'
      }`}
      draggable={false}
      style={{
        width: dashboardCarouselLayout.cardWidth,
        height: dashboardCarouselLayout.cardHeight,
      }}
    >
      <div
        className="relative overflow-visible transition-transform"
        style={{
          transitionDuration: `${dashboardCarouselLayout.cardLiftDurationMs}ms`,
          transform: translateY
            ? `translateY(calc(-1 * ${translateY}))`
            : undefined,
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
              minHeight: dashboardCarouselLayout.sideActionSize,
            }}
          >
            <button
              type="button"
              disabled={isDeleting}
              onClick={event => {
                handleActionClick(event);
                if (isDeleting) return;
                void onDelete?.(invite.folderId);
              }}
              className={
                isDeleting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }
              aria-disabled={isDeleting}
            >
              <DeleteButton />
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
              unoptimized
              draggable={false}
              className="object-cover"
            />
            <div
              className={`absolute inset-0 bg-black/8 transition-opacity duration-300 ${
                isSelected && showSelectedOverlay ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {isSelected && showCenterActions && invite && (
              <div
                className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
                style={{
                  gap: dashboardCarouselLayout.centerActionGap,
                  paddingBottom:
                    dashboardCarouselLayout.centerActionBottomPadding,
                }}
              >
                <DashboardActionButton
                  icon={KakaoIcon}
                  variant="kakao"
                  disabled={isSharing}
                  onClick={event => {
                    handleActionClick(event);
                    if (!canShare) return;
                    void onShare?.(invite.folderId);
                  }}
                >
                  카카오톡 공유하기
                </DashboardActionButton>
                {isUrlActionExpanded ? (
                  <div
                    className="flex items-center gap-0.5 rounded-lg bg-[#121212] px-2 py-1.5"
                    style={{
                      flex: '0 0 auto',
                      width: dashboardCarouselLayout.primaryActionWidth,
                      minWidth: dashboardCarouselLayout.primaryActionWidth,
                      maxWidth: dashboardCarouselLayout.primaryActionWidth,
                      height: dashboardCarouselLayout.primaryActionHeight,
                    }}
                  >
                    <button
                      type="button"
                      onClick={event => {
                        handleActionClick(event);
                        onCopyUrl?.(invite.folderId);
                      }}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg font-pretendard text-[13px] font-semibold leading-[18px] text-[#38BDF8] transition-colors hover:bg-[rgba(56,189,248,0.12)]"
                    >
                      복사
                    </button>
                    <a
                      href={publishedUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={event => {
                        event.stopPropagation();
                      }}
                      className="flex h-8 min-w-0 flex-1 items-center rounded-lg px-1.5 font-pretendard text-[14px] font-normal leading-5 text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                    >
                      <span className="block min-w-0 flex-1 truncate">
                        {publishedUrl ?? 'URL 링크 준비 중'}
                      </span>
                    </a>
                  </div>
                ) : (
                  <DashboardActionButton
                    icon={LinkIcon}
                    variant="url"
                    onClick={event => {
                      handleActionClick(event);
                      setIsUrlActionExpanded(true);
                    }}
                  >
                    URL 링크 공유하기
                  </DashboardActionButton>
                )}
                <DashboardActionButton
                  icon={EditIcon}
                  variant="outline"
                  onClick={event => {
                    handleActionClick(event);
                    onUpdate?.(invite.folderId, invite.invitationUuid);
                  }}
                >
                  재편집하기
                </DashboardActionButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CarouselItem;
