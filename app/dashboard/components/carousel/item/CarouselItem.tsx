import Image from 'next/image';
import { KeyboardEvent, MouseEvent, useEffect, useState } from 'react';

import EditIcon from '@/shared/assets/icons/edit.svg';
import KakaoIcon from '@/shared/assets/icons/kakao2.svg';
import LinkIcon from '@/shared/assets/icons/link.svg';

import { dashboardCarouselLayout } from '../carouselLayout';
import { CarouselCardItem } from '../carouselTypes';

import DashboardActionButton from './actions/DashboardActionButton';
import DeleteButton from './actions/DeleteButton';
import ItemHeader from './ItemHeader';

function getImageKey(image: CarouselCardItem['image']) {
  return typeof image === 'string' ? image : image.src;
}

type CarouselItemProps = {
  item: CarouselCardItem;
  index: number;
  isSelected: boolean;
  showHeader?: boolean;
  showSideActions?: boolean;
  showCenterActions?: boolean;
  selectedLift?: string;
  preloadImage?: boolean;
  onSelect: (index: number) => void;
  onDelete?: (folderId: string) => void | Promise<void>;
  onUpdate?: (folderId: string, uuid?: string) => void;
  onToggleVisibility?: (
    folderId: string,
    nextVisible: boolean
  ) => void | Promise<void>;
  onOpenUrlShare?: (folderId: string) => void;
  onCopyUrl?: (folderId: string) => void;
  onShare?: (folderId: string) => Promise<void>;
  guestUrl: string | null;
  isDeleting: boolean;
  isSharing: boolean;
  isVisibilityUpdating: boolean;
  visibilityError: string | null;
};

function CarouselItem({
  item,
  index,
  isSelected,
  showHeader = false,
  showSideActions = false,
  showCenterActions = false,
  selectedLift: selectedLiftProp = dashboardCarouselLayout.selectedLift,
  preloadImage = false,
  onSelect,
  onDelete,
  onUpdate,
  onToggleVisibility,
  onOpenUrlShare,
  onCopyUrl,
  onShare,
  guestUrl: guestUrlProp,
  isDeleting,
  isSharing,
  isVisibilityUpdating,
  visibilityError,
}: CarouselItemProps) {
  const [isUrlActionExpanded, setIsUrlActionExpanded] = useState(false);
  const currentImageKey = getImageKey(item.image);
  const [hasImageError, setHasImageError] = useState(false);
  const invite = item.invite;
  const guestUrl = invite?.guestUrl ?? guestUrlProp;
  const isPublished = invite?.published ?? Boolean(guestUrlProp);
  const readiness = invite?.readiness ?? (guestUrl ? 'ready' : 'idle');
  const isPending =
    Boolean(invite?.isPending) ||
    readiness === 'pending' ||
    readiness === 'checking';
  const canUseGuestUrl = Boolean(!isPending && guestUrl);
  const canAttemptShare = Boolean(invite?.hasKakaoShareData && !isPending);
  const canToggleVisibility = Boolean(
    invite && !isPending && !isVisibilityUpdating
  );
  const showSelectedOverlay =
    showHeader || showSideActions || showCenterActions;
  const hoverLift = showHeader
    ? `calc(${selectedLiftProp} - ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const selectedLift = showHeader
    ? `calc(${selectedLiftProp} + ${dashboardCarouselLayout.headerHeight})`
    : selectedLiftProp;
  const displayImage =
    hasImageError && item.fallbackImage ? item.fallbackImage : item.image;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasImageError(false);
  }, [currentImageKey]);

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
        className={`relative overflow-visible transition-transform ${
          isSelected
            ? '[transform:translateY(calc(-1*var(--carousel-selected-lift)))]'
            : 'group-hover:[transform:translateY(calc(-1*var(--carousel-hover-lift)))]'
        }`}
        style={{
          transitionDuration: `${dashboardCarouselLayout.cardLiftDurationMs}ms`,
          ['--carousel-hover-lift' as string]: hoverLift,
          ['--carousel-selected-lift' as string]: selectedLift,
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
                isPublished={isPublished}
                disabled={!canToggleVisibility}
                isBusy={isVisibilityUpdating}
                hasError={Boolean(visibilityError)}
                onToggle={() => {
                  if (!invite || !canToggleVisibility) return;
                  void onToggleVisibility?.(invite.folderId, !isPublished);
                }}
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
              src={displayImage}
              alt={item.alt}
              fill
              sizes="260px"
              preload={preloadImage}
              unoptimized={typeof displayImage === 'string'}
              draggable={false}
              className="object-cover"
              onError={() => {
                if (!hasImageError && item.fallbackImage) {
                  setHasImageError(true);
                }
              }}
            />
            <div
              className={`absolute inset-0 bg-black/8 transition-opacity duration-300 ${
                isSelected && showSelectedOverlay ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {isPending && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/72 text-[#121212] backdrop-blur-[2px]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#121212]" />
                <p className="font-pretendard text-[13px] font-semibold leading-[18px]">
                  초대장 준비 중
                </p>
              </div>
            )}
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
                  disabled={isSharing || !canAttemptShare}
                  onClick={event => {
                    handleActionClick(event);
                    if (!canAttemptShare) return;
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
                      disabled={!canUseGuestUrl}
                      onClick={event => {
                        handleActionClick(event);
                        if (!canUseGuestUrl) return;
                        onCopyUrl?.(invite.folderId);
                      }}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg font-pretendard text-[13px] font-semibold leading-[18px] text-[#38BDF8] transition-colors hover:bg-[rgba(56,189,248,0.12)]"
                    >
                      복사
                    </button>
                    <a
                      href={
                        canUseGuestUrl ? (guestUrl ?? undefined) : undefined
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={event => {
                        event.stopPropagation();
                      }}
                      className="flex h-8 min-w-0 flex-1 items-center rounded-lg px-1.5 font-pretendard text-[14px] font-normal leading-5 text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                    >
                      <span className="block min-w-0 flex-1 truncate">
                        {guestUrl ?? 'URL 링크 준비 중'}
                      </span>
                    </a>
                  </div>
                ) : (
                  <DashboardActionButton
                    icon={LinkIcon}
                    variant="url"
                    disabled={!canUseGuestUrl}
                    onClick={event => {
                      handleActionClick(event);
                      if (!canUseGuestUrl) return;
                      onOpenUrlShare?.(invite.folderId);
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
