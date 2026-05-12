'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  DeleteInvitationResponse,
  InviteListItem,
  KakaoShareData,
  LoadInvitationResponse,
  PublishResult,
} from '@/app/dashboard/types';
import { DEFAULT_IMAGE_URL } from '@/app/guest/[id]/constants/constant';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

type DeleteStateMap = Record<string, boolean>;
type DeleteErrorMap = Record<string, string | null>;
type PublishStateMap = Record<string, boolean>;
type PublishErrorMap = Record<string, string | null>;
type PublishResultMap = Record<string, PublishResult | null>;
type ShareStateMap = Record<string, boolean>;
type LoadInvitationErrorPayload = { message?: string };
type UseDashboardInvitationsOptions = {
  loadOnMount?: boolean;
};
type ShareUrlResponse = {
  ok: boolean;
  data?: KakaoShareData;
  error?: string;
};

const READINESS_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000];

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

function resolveShareImageUrl(imageFileId?: string, origin?: string) {
  return imageFileId
    ? `https://lh3.googleusercontent.com/d/${imageFileId}`
    : `${origin || window.location.origin}${DEFAULT_IMAGE_URL}`;
}

function shareInvitationWithKakao(shareData: KakaoShareData, origin: string) {
  if (typeof window === 'undefined' || !window.Kakao) {
    throw new Error('카카오 SDK 스크립트가 아직 로드되지 않았습니다.');
  }

  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!kakaoJsKey) {
    throw new Error('NEXT_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다.');
  }

  if (!shareData.showShareButton) {
    throw new Error('이 초대장은 카카오톡 공유가 비활성화되어 있습니다.');
  }

  const safeLinkUrl = shareData.invitationUrl || window.location.href;
  if (!safeLinkUrl) {
    throw new Error('공유할 초대장 링크가 없습니다.');
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoJsKey);
  }

  const messageButtons = [
    {
      title: '보러가기',
      link: {
        mobileWebUrl: safeLinkUrl,
        webUrl: safeLinkUrl,
      },
    },
  ];

  if (shareData.showLocationButton && shareData.locationInfo) {
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
      shareData.locationInfo.placeName
    )},${shareData.locationInfo.lat},${shareData.locationInfo.lng}`;

    const baseOrigin = origin || window.location.origin;
    const bypassUrl = `${baseOrigin}/api/map-redirect?url=${encodeURIComponent(
      kakaoMapUrl
    )}`;

    messageButtons.push({
      title: '위치보기',
      link: {
        mobileWebUrl: bypassUrl,
        webUrl: bypassUrl,
      },
    });
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: shareData.title || DEFAULT_TITLE,
      description: shareData.description || DEFAULT_DESCRIPTION,
      imageUrl: resolveShareImageUrl(shareData.imageFileId, origin),
      link: {
        mobileWebUrl: safeLinkUrl,
        webUrl: safeLinkUrl,
      },
    },
    buttons: messageButtons,
  });
}

function shouldRedirectToHome(status: number, message: string | null) {
  return (
    status === 401 ||
    message === '재로그인이 필요합니다.' ||
    message === '유효한 요청이 아닙니다.'
  );
}

function resolvePublishedUrl(result: PublishResult | null, origin: string) {
  if (!result?.guestUrl) return null;
  if (result.guestUrl.startsWith('http')) return result.guestUrl;
  return origin ? `${origin}${result.guestUrl}` : result.guestUrl;
}

function getPayloadMessage(
  payload: LoadInvitationResponse | LoadInvitationErrorPayload | null
) {
  return payload && 'message' in payload && typeof payload.message === 'string'
    ? payload.message
    : null;
}

function createInitialPublishResults(
  invites: InviteListItem[]
): PublishResultMap {
  return invites.reduce<PublishResultMap>((acc, invite) => {
    if (!invite.publishedUrl) return acc;

    acc[invite.folderId] = {
      ok: true,
      published: true,
      ready: true,
      guestUrl: invite.publishedUrl,
    };
    return acc;
  }, {});
}

function useDashboardInvitations(
  initialInvites: InviteListItem[] = [],
  options: UseDashboardInvitationsOptions = {}
) {
  const router = useRouter();
  const loadOnMount = options.loadOnMount ?? initialInvites.length === 0;

  const [loading, setLoading] = useState(loadOnMount);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteListItem[]>(initialInvites);
  const [origin, setOrigin] = useState('');
  const [deleteBusy, setDeleteBusy] = useState<DeleteStateMap>({});
  const [deleteErrors, setDeleteErrors] = useState<DeleteErrorMap>({});
  const [publishBusy, setPublishBusy] = useState<PublishStateMap>({});
  const [publishErrors, setPublishErrors] = useState<PublishErrorMap>({});
  const [readinessPolling, setReadinessPolling] = useState<PublishStateMap>({});
  const [shareBusy, setShareBusy] = useState<ShareStateMap>({});
  const [publishResults, setPublishResults] = useState<PublishResultMap>(
    createInitialPublishResults(initialInvites)
  );

  const resetPublishState = useCallback(() => {
    setPublishBusy({});
    setPublishErrors({});
    setReadinessPolling({});
    setPublishResults({});
  }, []);

  const clearInvitationTransientState = useCallback((folderId: string) => {
    setDeleteBusy(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setDeleteErrors(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setPublishBusy(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setPublishErrors(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setReadinessPolling(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setShareBusy(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
    setPublishResults(prev => {
      const next = { ...prev };
      delete next[folderId];
      return next;
    });
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/drive/loadInvitation', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await res.json().catch(() => null)) as
        | LoadInvitationResponse
        | LoadInvitationErrorPayload
        | null;
      const payloadMessage = getPayloadMessage(payload);

      if (shouldRedirectToHome(res.status, payloadMessage)) {
        setInvites([]);
        setError(null);
        setDeleteBusy({});
        setDeleteErrors({});
        resetPublishState();
        router.replace('/');
        router.refresh();
        return;
      }

      if (!res.ok) {
        throw new Error(payloadMessage ?? '초대장 목록을 불러오지 못했습니다.');
      }

      const loadedInvites = (payload as LoadInvitationResponse).invites ?? [];

      setInvites(loadedInvites);
      setDeleteBusy({});
      setDeleteErrors({});
      setPublishBusy({});
      setPublishErrors({});
      setReadinessPolling({});
      setPublishResults(createInitialPublishResults(loadedInvites));
    } catch (err) {
      console.error(err);
      setInvites([]);
      setDeleteBusy({});
      setDeleteErrors({});
      resetPublishState();
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [resetPublishState, router]);

  useEffect(() => {
    if (!loadOnMount) {
      return;
    }

    void loadInvitations();
  }, [loadInvitations, loadOnMount]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const pollGuestReadiness = useCallback(
    async (folderId: string, initialResult: PublishResult) => {
      const dataJsonFileId = initialResult.dataJsonFileId;
      if (!dataJsonFileId) return;

      setReadinessPolling(prev => ({ ...prev, [folderId]: true }));

      let latestResult = initialResult;

      try {
        for (const delayMs of READINESS_POLL_DELAYS_MS) {
          await sleep(delayMs);

          const res = await fetch(
            `/api/drive/publishInvitation/readiness?dataJsonFileId=${encodeURIComponent(
              dataJsonFileId
            )}`,
            { method: 'GET', cache: 'no-store' }
          );

          const json = (await res.json().catch(() => ({}))) as PublishResult;
          latestResult = {
            ...latestResult,
            ...json,
            guestUrl: json.guestUrl ?? latestResult.guestUrl,
            dataJsonFileId: json.dataJsonFileId ?? dataJsonFileId,
          };

          setPublishResults(prev => ({ ...prev, [folderId]: latestResult }));

          if (res.ok && json.ready === true) {
            break;
          }
        }
      } catch (err) {
        console.error('Guest readiness polling failed:', err);
      } finally {
        setReadinessPolling(prev => ({ ...prev, [folderId]: false }));
      }
    },
    []
  );

  const handlePublish = useCallback(async (invitationFolderId: string) => {
    if (!invitationFolderId) return;

    setPublishErrors(prev => ({ ...prev, [invitationFolderId]: null }));
    setPublishResults(prev => ({ ...prev, [invitationFolderId]: null }));
    setPublishBusy(prev => ({ ...prev, [invitationFolderId]: true }));
    setReadinessPolling(prev => ({ ...prev, [invitationFolderId]: false }));

    try {
      const res = await fetch('/api/drive/publishInvitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationFolderId }),
      });

      const json = (await res.json().catch(() => ({}))) as PublishResult;

      if (!res.ok || json.ok === false) {
        setPublishResults(prev => ({ ...prev, [invitationFolderId]: json }));
        setPublishErrors(prev => ({
          ...prev,
          [invitationFolderId]: json.error
            ? `Publish failed: ${json.error}`
            : `Publish failed: ${res.status}`,
        }));
        return;
      }

      setPublishResults(prev => ({ ...prev, [invitationFolderId]: json }));

      if (json.ready === false) {
        void pollGuestReadiness(invitationFolderId, json);
      }
    } catch (err) {
      setPublishErrors(prev => ({
        ...prev,
        [invitationFolderId]:
          err instanceof Error ? err.message : 'Publish request failed.',
      }));
    } finally {
      setPublishBusy(prev => ({ ...prev, [invitationFolderId]: false }));
    }
  }, [pollGuestReadiness]);

  const handleDelete = useCallback(
    async (folderId: string) => {
      if (!folderId) return;

      const shouldDelete = window.confirm('초대장을 삭제하시겠습니까?');
      if (!shouldDelete) return;

      let isDeleted = false;
      setDeleteErrors(prev => ({ ...prev, [folderId]: null }));
      setDeleteBusy(prev => ({ ...prev, [folderId]: true }));

      try {
        const res = await fetch('/api/drive/deleteInvitation', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId }),
        });

        const payload = (await res
          .json()
          .catch(() => null)) as DeleteInvitationResponse | null;

        if (!res.ok || payload?.success === false) {
          throw new Error(payload?.message ?? '초대장 삭제에 실패했습니다.');
        }

        setInvites(prev => prev.filter(invite => invite.folderId !== folderId));
        isDeleted = true;
        clearInvitationTransientState(folderId);
      } catch (err) {
        console.error(err);
        setDeleteErrors(prev => ({
          ...prev,
          [folderId]:
            err instanceof Error ? err.message : '초대장 삭제에 실패했습니다.',
        }));
      } finally {
        setDeleteBusy(prev => {
          if (!isDeleted) {
            return { ...prev, [folderId]: false };
          }

          const next = { ...prev };
          delete next[folderId];
          return next;
        });
      }
    },
    [clearInvitationTransientState]
  );

  const handleUpdate = useCallback(
    (folderId: string, uuid?: string) => {
      if (!uuid) {
        console.warn('invitationUuid is missing');
        return;
      }

      router.push(`/editor/${folderId}?uuid=${uuid}`);
    },
    [router]
  );

  const handleCopyPublishedUrl = useCallback(
    async (folderId: string) => {
      const finalUrl = resolvePublishedUrl(
        publishResults[folderId] ?? null,
        origin
      );
      if (!finalUrl) return;

      try {
        await navigator.clipboard.writeText(finalUrl);
      } catch (err) {
        console.error(err);
      }
    },
    [origin, publishResults]
  );

  const loadShareData = useCallback(async (folderId: string) => {
    const res = await fetch(
      `/api/drive/shareUrl?invitationFolderId=${encodeURIComponent(folderId)}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    const payload = (await res
      .json()
      .catch(() => null)) as ShareUrlResponse | null;

    if (!res.ok || payload?.ok === false || !payload?.data) {
      throw new Error(payload?.error ?? '공유 데이터를 불러오지 못했습니다.');
    }

    return payload.data;
  }, []);

  const handleShare = useCallback(
    async (folderId: string) => {
      if (!folderId) return;
      if (shareBusy[folderId]) return;

      setShareBusy(prev => ({ ...prev, [folderId]: true }));
      try {
        const shareData = await loadShareData(folderId);
        shareInvitationWithKakao(shareData, origin);
      } catch (err) {
        console.error(err);
        window.alert(
          err instanceof Error
            ? err.message
            : '카카오톡 공유 중 오류가 발생했습니다.'
        );
      } finally {
        setShareBusy(prev => ({ ...prev, [folderId]: false }));
      }
    },
    [loadShareData, origin, shareBusy]
  );

  const getPublishedUrl = useCallback(
    (folderId: string) =>
      resolvePublishedUrl(publishResults[folderId] ?? null, origin),
    [origin, publishResults]
  );

  const isPublishing = useCallback(
    (folderId: string) => Boolean(publishBusy[folderId]),
    [publishBusy]
  );

  const isPublishReadinessPolling = useCallback(
    (folderId: string) => Boolean(readinessPolling[folderId]),
    [readinessPolling]
  );

  const isPublishReadyPending = useCallback(
    (folderId: string) =>
      !publishErrors[folderId] && publishResults[folderId]?.ready === false,
    [publishErrors, publishResults]
  );

  const isSharing = useCallback(
    (folderId: string) => Boolean(shareBusy[folderId]),
    [shareBusy]
  );

  const isDeleting = useCallback(
    (folderId: string) => Boolean(deleteBusy[folderId]),
    [deleteBusy]
  );

  const getDeleteError = useCallback(
    (folderId: string) => deleteErrors[folderId] ?? null,
    [deleteErrors]
  );

  const getPublishError = useCallback(
    (folderId: string) => publishErrors[folderId] ?? null,
    [publishErrors]
  );

  return {
    invites,
    loading,
    error,
    loadInvitations,
    handleDelete,
    handlePublish,
    handleUpdate,
    handleCopyPublishedUrl,
    handleShare,
    loadShareData,
    getPublishedUrl,
    isDeleting,
    isSharing,
    isPublishReadinessPolling,
    isPublishReadyPending,
    getDeleteError,
    isPublishing,
    getPublishError,
  };
}

export default useDashboardInvitations;
