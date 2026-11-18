import 'server-only';

import { notFound } from 'next/navigation';

import { resolveDriveImageSource } from '@/shared/utils/media/driveImageUtils';

import { GuestAccessNotice } from '../components/GuestAccessNotice';
import GuestInvitationView from '../components/GuestInvitationView';
import { GuestUnavailableNotice } from '../components/GuestUnavailableNotice';

import type { GuestInvitationResult } from './loadGuestInvitation';

export function renderGuestInvitationRoute(
  result: GuestInvitationResult,
  retryHref: string
) {
  if (result.status === 'invalid-audience') {
    return (
      <GuestAccessNotice
        kind="link"
        title="초대장 링크를 확인해 주세요"
        description="이 링크로 초대장을 열 수 없어요."
      />
    );
  }
  if (result.status === 'private') {
    return (
      <GuestAccessNotice
        title="비공개 초대장이에요"
        description={
          <>
            <span>초대장 주인이 공개로 전환하면</span>
            <span>이 링크에서 다시 확인할 수 있어요.</span>
          </>
        }
      />
    );
  }
  if (
    result.status === 'unavailable' ||
    result.status === 'audience-unavailable'
  ) {
    return <GuestUnavailableNotice retryHref={retryHref} />;
  }
  if (result.status === 'not-found' || result.status === 'missing-short-code') {
    notFound();
  }

  const { payload } = result;
  const thumbnailFileId = payload.mainPoster?.thumbnailFileId;
  const posterSrc = thumbnailFileId
    ? resolveDriveImageSource(thumbnailFileId, { mode: 'public' })
    : null;

  return (
    <>
      {posterSrc && (
        <link rel="preload" as="image" href={posterSrc} fetchPriority="high" />
      )}
      <GuestInvitationView payload={payload} mode="guest" collectionId={result.rootDataFileId} />
    </>
  );
}
