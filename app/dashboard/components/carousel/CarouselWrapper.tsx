'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDashboardInvitationPreview } from '@/app/dashboard/hooks/useDashboardInvitationPreview';
import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';
import { InviteListItem } from '@/app/dashboard/types';
import { getInvitationShowcaseItem } from '@/app/dashboard/utils/getInvitationShowcaseItem';
import { LinkShareModal } from '@/components/molecules/link-share/LinkShareModal';

import DashboardInvitationPreviewModal from '../preview/DashboardInvitationPreviewModal';

import AudienceVisibilityDialog from './AudienceVisibilityDialog';
import CarouselBase from './CarouselBase';
import { dashboardCarouselLayout } from './carouselLayout';
import { CarouselCardItem } from './carouselTypes';
import CopyInvitationDialog from './CopyInvitationDialog';
import DashboardCarouselSkeleton from './DashboardCarouselSkeleton';
import EmptyInvitationCard from './EmptyInvitationCard';

type CarouselWrapperProps = {
  initialInvites?: InviteListItem[];
  loadOnMount?: boolean;
};

const INITIAL_IMAGE_PRELOAD_COUNT = 5;
const IMAGE_PRELOAD_TIMEOUT_MS = 1800;

type ResolvedImageMap = Record<string, CarouselCardItem['image']>;

function getImageSrc(image: CarouselCardItem['image']) {
  return typeof image === 'string' ? image : image.src;
}

function getImageKey(image: CarouselCardItem['image'] | undefined) {
  return image ? getImageSrc(image) : '';
}

function getPreloadKey(items: CarouselCardItem[]) {
  return items
    .map(
      item =>
        `${item.id}:${getImageKey(item.image)}:${getImageKey(
          item.fallbackImage
        )}`
    )
    .join('|');
}

function preloadImage(image: CarouselCardItem['image']) {
  if (typeof window === 'undefined') {
    return Promise.resolve(true);
  }

  const src = getImageSrc(image);
  if (!src) {
    return Promise.resolve(false);
  }

  return new Promise<boolean>(resolve => {
    const imageLoader = new window.Image();
    let settled = false;

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(ok);
    };

    const timeoutId = window.setTimeout(
      () => finish(false),
      IMAGE_PRELOAD_TIMEOUT_MS
    );

    imageLoader.onload = () => finish(true);
    imageLoader.onerror = () => finish(false);
    imageLoader.src = src;
  });
}

async function resolvePreloadedImage(item: CarouselCardItem) {
  if (await preloadImage(item.image)) {
    return item.image;
  }

  const hasDedicatedThumbnail =
    typeof item.image === 'string' &&
    Boolean(item.fallbackImage) &&
    getImageKey(item.image) !== getImageKey(item.fallbackImage);

  if (hasDedicatedThumbnail) {
    return item.image;
  }

  if (item.fallbackImage) {
    await preloadImage(item.fallbackImage);
    return item.fallbackImage;
  }

  return item.image;
}

function getInitialImagePreloadItems(
  items: CarouselCardItem[],
  startIndex: number
) {
  const endIndex = Math.min(Math.max(startIndex, 0), items.length - 1);
  const startSliceIndex = Math.max(
    0,
    endIndex - INITIAL_IMAGE_PRELOAD_COUNT + 1
  );

  return items.slice(startSliceIndex, endIndex + 1);
}

function CarouselWrapper({
  initialInvites = [],
  loadOnMount,
}: CarouselWrapperProps) {
  const {
    invites,
    loading,
    handleClone,
    handleDelete,
    handleUpdate,
    handleToggleVisibility,
    loadInvitations,
    handleCopyGuestUrl,
    handleShare,
    getGuestUrl,
    isDeleting,
    isSharing,
    isVisibilityUpdating,
    getVisibilityError,
  } = useDashboardInvitations(initialInvites, { loadOnMount });
  const preview = useDashboardInvitationPreview();
  const [linkShare, setLinkShare] = useState<{
    url: string;
    recipient: string;
    notice?: string;
  } | null>(null);
  const closeLinkShare = useCallback(() => setLinkShare(null), []);
  const orderedInvites = useMemo(() => [...invites].reverse(), [invites]);
  const startIndex = Math.max(orderedInvites.length - 1, 0);
  const [resolvedImages, setResolvedImages] = useState<ResolvedImageMap>({});
  const [readyInitialPreloadKey, setReadyInitialPreloadKey] = useState<
    string | null
  >(null);
  const backgroundPreloadedKeysRef = useRef<Set<string>>(new Set());

  const [cloneTarget, setCloneTarget] = useState<InviteListItem | null>(null);
  const [visibilityTarget, setVisibilityTarget] =
    useState<InviteListItem | null>(null);
  const closeVisibility = useCallback(() => setVisibilityTarget(null), []);
  const [focusCardId, setFocusCardId] = useState<string | null>(null);
  const closeCloneDialog = useCallback(() => {
    setCloneTarget(null);
  }, []);

  const items: CarouselCardItem[] = useMemo(
    () =>
      orderedInvites.map(invite => {
        const showcaseItem = getInvitationShowcaseItem(invite.folderId);
        const thumbnailUrl = invite.thumbnailUrl?.trim();

        return {
          id: invite.folderId,
          image: thumbnailUrl || showcaseItem.image,
          fallbackImage: showcaseItem.image,
          alt: showcaseItem.alt,
          invite,
        };
      }),
    [orderedInvites]
  );
  const initialPreloadItems = useMemo(
    () => getInitialImagePreloadItems(items, startIndex),
    [items, startIndex]
  );
  const initialPreloadIds = useMemo(
    () => new Set(initialPreloadItems.map(item => item.id)),
    [initialPreloadItems]
  );
  const initialPreloadKey = useMemo(
    () => getPreloadKey(initialPreloadItems),
    [initialPreloadItems]
  );
  const initialImagesReady =
    items.length === 0 || readyInitialPreloadKey === initialPreloadKey;
  const displayItems = useMemo(
    () =>
      items.map(item => ({
        ...item,
        image: resolvedImages[item.id] ?? item.image,
      })),
    [items, resolvedImages]
  );

  useEffect(() => {
    if (loading || items.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.all(
      initialPreloadItems.map(
        async item => [item.id, await resolvePreloadedImage(item)] as const
      )
    ).then(entries => {
      if (cancelled) return;

      setResolvedImages(prev => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
      setReadyInitialPreloadKey(initialPreloadKey);
    });

    return () => {
      cancelled = true;
    };
  }, [initialPreloadItems, initialPreloadKey, items.length, loading]);

  useEffect(() => {
    if (!initialImagesReady) {
      return;
    }

    let cancelled = false;

    items
      .filter(item => {
        if (initialPreloadIds.has(item.id)) {
          return false;
        }

        const preloadKey = getPreloadKey([item]);
        if (backgroundPreloadedKeysRef.current.has(preloadKey)) {
          return false;
        }

        backgroundPreloadedKeysRef.current.add(preloadKey);
        return true;
      })
      .forEach(item => {
        void resolvePreloadedImage(item).then(image => {
          if (cancelled) return;

          setResolvedImages(prev => ({
            ...prev,
            [item.id]: image,
          }));
        });
      });

    return () => {
      cancelled = true;
    };
  }, [initialImagesReady, initialPreloadIds, items]);

  if (loading || (items.length > 0 && readyInitialPreloadKey === null)) {
    return <DashboardCarouselSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyInvitationCard />;
  }

  return (
    <>
      {visibilityTarget && (
        <AudienceVisibilityDialog
          invite={visibilityTarget}
          onClose={closeVisibility}
          onSaved={() => {
            closeVisibility();
            void loadInvitations();
          }}
        />
      )}
      {cloneTarget && (
        <CopyInvitationDialog
          key={cloneTarget.folderId}
          invite={cloneTarget}
          onClone={handleClone}
          onCloned={folderId => {
            closeCloneDialog();
            setFocusCardId(folderId);
          }}
          onClose={closeCloneDialog}
        />
      )}
      <CarouselBase
        items={displayItems}
        startIndex={startIndex}
        stageHeight={dashboardCarouselLayout.dashboardStageHeight}
        selectedLift={dashboardCarouselLayout.dashboardSelectedLift}
        showHeader
        showSideActions
        showCenterActions
        focusCardId={focusCardId}
        onClone={setCloneTarget}
        onDelete={handleDelete}
        onPreview={preview.openPreview}
        onUpdate={handleUpdate}
        onToggleVisibility={(folderId, nextVisible) => {
          const invite = invites.find(item => item.folderId === folderId);
          if (invite?.hasAudienceGroups) setVisibilityTarget(invite);
          else void handleToggleVisibility(folderId, nextVisible);
        }}
        onCopyUrl={(folderId, url, audienceName) => {
          const invite = invites.find(item => item.folderId === folderId);
          if (!invite) return;

          void handleCopyGuestUrl(folderId, url);
          setLinkShare({
            url,
            recipient: `${invite.displayTitle ?? invite.name} · ${audienceName}`,
            notice:
              invite?.published === false
                ? '비공개 초대장이에요. 공개로 변경하면 링크와 QR로 접속할 수 있어요.'
                : undefined,
          });
        }}
        onShare={handleShare}
        getGuestUrl={getGuestUrl}
        isDeleting={isDeleting}
        isSharing={isSharing}
        isVisibilityUpdating={isVisibilityUpdating}
        getVisibilityError={getVisibilityError}
      />
      {linkShare && (
        <LinkShareModal
          url={linkShare.url}
          recipient={linkShare.recipient}
          notice={linkShare.notice}
          onClose={closeLinkShare}
        />
      )}
      <DashboardInvitationPreviewModal
        errorMessage={preview.errorMessage}
        target={preview.target}
        isOpen={preview.isOpen}
        onClose={preview.closePreview}
        onRetry={preview.openPreview}
        payload={preview.payload}
        requestId={preview.requestId}
        status={preview.status}
      />
    </>
  );
}
export default CarouselWrapper;
