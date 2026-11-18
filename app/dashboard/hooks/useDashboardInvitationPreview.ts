'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

type PreviewStatus = 'idle' | 'loading' | 'success' | 'error';

type PreviewState = {
  errorMessage: string | null;
  folderId: string | null;
  isOpen: boolean;
  payload: NormalizedGuestPayload | null;
  requestId: number;
  status: PreviewStatus;
};

type PreviewInvitationResponse =
  | {
      ok: true;
      payload: NormalizedGuestPayload;
    }
  | {
      ok: false;
      message?: string;
      userMessage?: string;
    };

const initialState: PreviewState = {
  errorMessage: null,
  folderId: null,
  isOpen: false,
  payload: null,
  requestId: 0,
  status: 'idle',
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
  const [state, setState] = useState<PreviewState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const closePreview = useCallback(() => {
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    // fade-out 애니메이션이 끝날 때까지 마지막 payload는 유지한다.
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const openPreview = useCallback(async (folderId: string) => {
    if (!folderId) return;

    // 이전 요청이 늦게 도착해도 최신 미리보기 상태를 덮지 못하도록 요청 번호를 올린다.
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState({
      errorMessage: null,
      folderId,
      isOpen: true,
      payload: null,
      requestId,
      status: 'loading',
    });

    try {
      const res = await fetch(
        `/api/drive/previewInvitation?folderId=${encodeURIComponent(
          folderId
        )}`,
        {
          cache: 'no-store',
          signal: controller.signal,
        }
      );
      const payload = (await res
        .json()
        .catch(() => null)) as PreviewInvitationResponse | null;

      if (requestIdRef.current !== requestId) return;

      if (!res.ok || !payload?.ok) {
        setState({
          errorMessage: resolvePreviewErrorMessage(payload),
          folderId,
          isOpen: true,
          payload: null,
          requestId,
          status: 'error',
        });
        return;
      }

      setState({
        errorMessage: null,
        folderId,
        isOpen: true,
        payload: payload.payload,
        requestId,
        status: 'success',
      });
    } catch (err) {
      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        return;
      }

      setState({
        errorMessage:
          err instanceof Error
            ? err.message
            : '미리보기를 불러오는 중 오류가 발생했습니다.',
        folderId,
        isOpen: true,
        payload: null,
        requestId,
        status: 'error',
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    closePreview,
    openPreview,
  };
}
