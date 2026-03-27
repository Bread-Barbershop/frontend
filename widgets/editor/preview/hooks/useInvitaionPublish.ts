import { useState } from 'react';

type PublishResult = {
  ok: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  ignored?: string;
  error?: string;
  status?: number;
  details?: unknown;
};

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

  const handlePublish = async () => {
    setIsPublish(true);

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
  };
  return {
    handlePublish,
    publishResults,
    publishBusy,
    publishErrors,
    isPublish,
  };
};
