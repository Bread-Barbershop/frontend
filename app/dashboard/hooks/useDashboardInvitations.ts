'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  InviteListItem,
  LoadInvitationResponse,
  PublishResult,
} from '@/app/dashboard/types';

type PublishStateMap = Record<string, boolean>;
type PublishErrorMap = Record<string, string | null>;
type PublishResultMap = Record<string, PublishResult | null>;
type LoadInvitationErrorPayload = { message?: string };

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
  const [publishBusy, setPublishBusy] = useState<PublishStateMap>({});
  const [publishErrors, setPublishErrors] = useState<PublishErrorMap>({});
  const [publishResults, setPublishResults] = useState<PublishResultMap>({});

  const resetPublishState = useCallback(() => {
    setPublishBusy({});
    setPublishErrors({});
    setPublishResults({});
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

      if (!res.ok) {
        throw new Error(
          getPayloadMessage(payload) ?? '초대장 목록을 불러오지 못했습니다.'
        );
      }

      setInvites((payload as LoadInvitationResponse).invites ?? []);
      resetPublishState();
    } catch (err) {
      console.error(err);
      setInvites([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [resetPublishState]);

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

  const getPublishError = useCallback(
    (folderId: string) => publishErrors[folderId] ?? null,
    [publishErrors]
  );

  return {
    invites,
    loading,
    error,
    loadInvitations,
    handlePublish,
    handleUpdate,
    handleCopyPublishedUrl,
    getPublishedUrl,
    isPublishing,
    getPublishError,
  };
}

export default useDashboardInvitations;
