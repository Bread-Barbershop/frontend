'use client';

import { useCallback, useEffect, useState } from 'react';

type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
};

type LoadInvitationResponse = {
  workspaceFolderId: string;
  invites: InviteListItem[];
  nextPageToken: string | null;
};

type PublishResult = {
  ok: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  ignored?: string;
  error?: string;
  status?: number;
  details?: unknown;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString('ko-KR');
};

export default function LoadInvitationTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LoadInvitationResponse | null>(null);
  const [origin, setOrigin] = useState('');
  const [publishBusy, setPublishBusy] = useState<Record<string, boolean>>({});
  const [publishErrors, setPublishErrors] = useState<
    Record<string, string | null>
  >({});
  const [publishResults, setPublishResults] = useState<
    Record<string, PublishResult | null>
  >({});

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/drive/loadInvitation', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          typeof payload?.message === 'string'
            ? payload.message
            : '대시보드 로드에 실패했습니다.';
        throw new Error(message);
      }

      setData(payload as LoadInvitationResponse);
      setPublishBusy({});
      setPublishErrors({});
      setPublishResults({});
    } catch (err) {
      console.error(err);
      setData(null);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handlePublish = async (invitationFolderId: string) => {
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

  return (
    <section className="rounded-2xl border p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">대시보드 로드 테스트</h2>
          <p className="mt-1 text-sm text-neutral-600">
            초대장 폴더 목록을 불러와 화면에 표시합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={loadInvitations}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? '불러오는 중…' : '다시 불러오기'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-4">
          <div className="rounded-md border bg-neutral-50 p-3 text-xs text-neutral-700">
            <p className="font-medium">Workspace</p>
            <p className="mt-1 break-all text-neutral-600">
              {data.workspaceFolderId}
            </p>
            <p className="mt-1 text-neutral-500">
              초대장 수: {data.invites.length}
            </p>
            {data.nextPageToken && (
              <p className="mt-1 break-all text-neutral-500">
                nextPageToken: {data.nextPageToken}
              </p>
            )}
          </div>

          {data.invites.length === 0 ? (
            <div className="rounded-md border bg-white p-3 text-sm text-neutral-600">
              아직 등록된 초대장이 없습니다.
            </div>
          ) : (
            <ul className="space-y-3">
              {data.invites.map(invite => {
                const publishResult = publishResults[invite.folderId];
                const publishError = publishErrors[invite.folderId];
                const isPublishing = Boolean(publishBusy[invite.folderId]);
                const finalGuestUrl =
                  publishResult?.guestUrl &&
                  publishResult.guestUrl.startsWith('http')
                    ? publishResult.guestUrl
                    : publishResult?.guestUrl && origin
                      ? `${origin}${publishResult.guestUrl}`
                      : (publishResult?.guestUrl ?? null);

                return (
                  <li
                    key={invite.folderId}
                    className="rounded-md border bg-white p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-neutral-900">
                        {invite.name}
                      </p>
                      <span className="text-xs text-neutral-500">
                        {formatDate(invite.createdTime)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-neutral-600">
                      <p className="break-all">
                        invitationUuid: {invite.invitationUuid ?? '-'}
                      </p>
                      <p className="break-all">folderId: {invite.folderId}</p>
                    </div>

                    <div className="mt-3 rounded-md border bg-neutral-50 p-3 text-xs text-neutral-700">
                      <p className="font-medium">Publish invitation</p>
                      <p className="mt-1 text-neutral-500">
                        invitationFolderId: {invite.folderId}
                      </p>

                      <button
                        type="button"
                        onClick={() => handlePublish(invite.folderId)}
                        disabled={isPublishing}
                        className="mt-3 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {isPublishing ? 'Publishing...' : 'Publish invitation'}
                      </button>

                      {publishError && (
                        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          {publishError}
                        </div>
                      )}

                      {publishResult?.guestUrl && (
                        <div className="mt-3 rounded-md border bg-white p-3 text-xs text-neutral-700">
                          <p>guestUrl: {publishResult.guestUrl}</p>
                          {publishResult.dataJsonFileId && (
                            <p>
                              dataJsonFileId: {publishResult.dataJsonFileId}
                            </p>
                          )}
                          {publishResult.ignored && (
                            <p>note: {publishResult.ignored}</p>
                          )}
                          {finalGuestUrl && (
                            <p className="mt-2">
                              finalUrl:{' '}
                              <a
                                className="text-blue-600 underline"
                                href={finalGuestUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {finalGuestUrl}
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
