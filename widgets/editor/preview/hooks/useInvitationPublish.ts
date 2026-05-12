import { useState } from 'react';

type PublishResult = {
  ok: boolean;
  published?: boolean;
  ready?: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  ignored?: string;
  warning?: string;
  error?: string;
  status?: number;
  details?: unknown;
};

const READINESS_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000];

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

export const useInvitationPublish = ({
  invitationFolderId,
}: {
  invitationFolderId: string;
}) => {
  const [isPublish, setIsPublish] = useState(false);
  const [publishBusy, setPublishBusy] = useState<Record<string, boolean>>({});
  const [publishErrors, setPublishErrors] = useState<
    Record<string, string | null>
  >({});
  const [publishResults, setPublishResults] = useState<
    Record<string, PublishResult | null>
  >({});
  const [readinessPolling, setReadinessPolling] = useState<
    Record<string, boolean>
  >({});

  const pollGuestReadiness = async (
    folderId: string,
    initialResult: PublishResult
  ) => {
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
  };

  const handlePublish = async () => {
    if (!invitationFolderId) return;
    setIsPublish(true);

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
  };
  return {
    handlePublish,
    publishResults,
    publishBusy,
    readinessPolling,
    publishErrors,
    isPublish,
  };
};
