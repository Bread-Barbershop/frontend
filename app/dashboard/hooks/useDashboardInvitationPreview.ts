'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PreviewSnapshot } from '@/features/invitation/preview/previewSnapshot';

type ActivePreview = {
  errorMessage: string | null;
  folderId: string;
  snapshot: PreviewSnapshot | null;
};

type PreviewInvitationResponse =
  | {
      ok: true;
      payload: PreviewSnapshot['payload'];
    }
  | {
      ok: false;
      message?: string;
      userMessage?: string;
    };

function resolvePreviewErrorMessage(payload: PreviewInvitationResponse | null) {
  if (payload && payload.ok === false) {
    return (
      payload.userMessage ??
      payload.message ??
      '미리보기를 불러오는 중 오류가 발생했습니다.'
    );
  }

  return '미리보기를 불러오는 중 오류가 발생했습니다.';
}

export function useDashboardInvitationPreview() {
  const [preview, setPreview] = useState<ActivePreview | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const closePreview = useCallback(() => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setPreview(null);
  }, []);

  const openPreview = useCallback(async (folderId: string) => {
    if (!folderId) return;

    // 이전 요청이 늦게 도착해도 최신 미리보기 상태를 덮지 못하도록 요청 번호를 올린다.
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setPreview({ errorMessage: null, folderId, snapshot: null });

    try {
      const res = await fetch(
        `/api/drive/previewInvitation?folderId=${encodeURIComponent(folderId)}`,
        {
          cache: 'no-store',
          signal: controller.signal,
        }
      );
      const payload = (await res
        .json()
        .catch(() => null)) as PreviewInvitationResponse | null;

      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        return;
      }

      if (!res.ok || !payload?.ok) {
        setPreview({
          errorMessage: resolvePreviewErrorMessage(payload),
          folderId,
          snapshot: null,
        });
        return;
      }

      setPreview({
        errorMessage: null,
        folderId,
        snapshot: {
          payload: payload.payload,
          previewFolderId: folderId,
          localAudioSrc: null,
        },
      });
    } catch (err) {
      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        return;
      }

      setPreview({
        errorMessage:
          err instanceof Error
            ? err.message
            : '미리보기를 불러오는 중 오류가 발생했습니다.',
        folderId,
        snapshot: null,
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    preview,
    closePreview,
    openPreview,
  };
}
