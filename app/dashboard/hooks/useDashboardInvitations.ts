'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  DeleteInvitationResponse,
  InviteListItem,
  LoadInvitationResponse,
  PublishResult,
} from '@/app/dashboard/types';

type DeleteStateMap = Record<string, boolean>;
type DeleteErrorMap = Record<string, string | null>;
type PublishStateMap = Record<string, boolean>;
type PublishErrorMap = Record<string, string | null>;
type PublishResultMap = Record<string, PublishResult | null>;
type LoadInvitationErrorPayload = { message?: string };

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

function useDashboardInvitations() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteListItem[]>([]);
  const [origin, setOrigin] = useState('');
  const [deleteBusy, setDeleteBusy] = useState<DeleteStateMap>({});
  const [deleteErrors, setDeleteErrors] = useState<DeleteErrorMap>({});
  const [publishBusy, setPublishBusy] = useState<PublishStateMap>({});
  const [publishErrors, setPublishErrors] = useState<PublishErrorMap>({});
  const [publishResults, setPublishResults] = useState<PublishResultMap>({});

  const resetPublishState = useCallback(() => {
    setPublishBusy({});
    setPublishErrors({});
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
        router.replace('/');
        router.refresh();
        return;
      }

      if (!res.ok) {
        throw new Error(payloadMessage ?? '초대장 목록을 불러오지 못했습니다.');
      }

      setInvites((payload as LoadInvitationResponse).invites ?? []);
      setDeleteBusy({});
      setDeleteErrors({});
      resetPublishState();
    } catch (err) {
      console.error(err);
      setInvites([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [resetPublishState, router]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handlePublish = useCallback(async (invitationFolderId: string) => {
    if (!invitationFolderId) return;

    setPublishErrors(prev => ({ ...prev, [invitationFolderId]: null }));
    setPublishResults(prev => ({ ...prev, [invitationFolderId]: null }));
    setPublishBusy(prev => ({ ...prev, [invitationFolderId]: true }));

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
    } catch (err) {
        setPublishErrors(prev => ({
          ...prev,
          [invitationFolderId]:
            err instanceof Error ? err.message : 'Publish request failed.',
        }));
    } finally {
      setPublishBusy(prev => ({ ...prev, [invitationFolderId]: false }));
    }
  }, []);

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

        const payload = (await res.json().catch(() => null)) as
          | DeleteInvitationResponse
          | null;

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
      const finalUrl = resolvePublishedUrl(publishResults[folderId] ?? null, origin);
      if (!finalUrl) return;

      try {
        await navigator.clipboard.writeText(finalUrl);
      } catch (err) {
        console.error(err);
      }
    },
    [origin, publishResults]
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
    getPublishedUrl,
    isDeleting,
    getDeleteError,
    isPublishing,
    getPublishError,
  };
}

export default useDashboardInvitations;
