'use client';

import { useEffect, useState } from 'react';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

import PhonePreviewFrame from './PhonePreviewFrame';

type DashboardInvitationPreviewModalProps = {
  errorMessage: string | null;
  folderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (folderId: string) => void;
  payload: NormalizedGuestPayload | null;
  requestId: number;
  status: 'idle' | 'loading' | 'success' | 'error';
};

function DashboardInvitationPreviewModal({
  errorMessage,
  folderId,
  isOpen,
  onClose,
  onRetry,
  payload,
  requestId,
  status,
}: DashboardInvitationPreviewModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [readyPosterKey, setReadyPosterKey] = useState<string | null>(null);
  // payload가 도착해도 대표 이미지가 준비되기 전까지는 로딩 UI를 유지한다.
  const posterKey = payload
    ? `${requestId}:${folderId ?? ''}:${
        payload.mainPoster.thumbnailFileId ?? 'no-thumbnail'
      }`
    : null;
  const isPosterReady = Boolean(posterKey && readyPosterKey === posterKey);

  useEffect(() => {
    if (isOpen) {
      let visibleFrameId = 0;
      const renderFrameId = requestAnimationFrame(() => {
        setShouldRender(true);
        visibleFrameId = requestAnimationFrame(() => setIsVisible(true));
      });

      return () => {
        cancelAnimationFrame(renderFrameId);
        cancelAnimationFrame(visibleFrameId);
      };
    }

    // 닫힐 때는 바로 unmount하지 않고 opacity/scale transition을 먼저 보여준다.
    const hiddenFrameId = requestAnimationFrame(() => setIsVisible(false));
    const timeoutId = window.setTimeout(() => setShouldRender(false), 220);
    return () => {
      cancelAnimationFrame(hiddenFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/58 px-6 py-6 transition-opacity duration-200 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="초대장 미리보기"
      onClick={onClose}
    >
      <div
        className={`relative flex max-h-full max-w-full items-center justify-center transition-all duration-200 ease-out ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-2 scale-[0.985]'
        }`}
        onClick={event => event.stopPropagation()}
      >
        <PhonePreviewFrame
          folderId={folderId ?? ''}
          isPosterReady={isPosterReady}
          onMainPosterReady={() => {
            if (!posterKey) return;
            setReadyPosterKey(posterKey);
          }}
          payload={status === 'success' ? payload : null}
        >
          <div className="flex min-h-full flex-col items-center justify-center px-8 text-center">
            {status === 'loading' || (status === 'success' && payload) ? (
              <>
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-[#121212]" />
                <p className="mt-5 font-pretendard text-[15px] font-semibold leading-[22px] text-[#121212]">
                  초대장을 불러오고 있어요.
                </p>
              </>
            ) : (
              <>
                <p className="font-pretendard text-[15px] font-semibold leading-[22px] text-[#121212]">
                  {errorMessage ?? '미리보기를 불러오지 못했습니다.'}
                </p>
                {folderId && (
                  <button
                    type="button"
                    onClick={() => onRetry(folderId)}
                    className="mt-5 h-10 rounded-lg bg-[#121212] px-5 font-pretendard text-[14px] font-semibold leading-5 text-white transition-colors hover:bg-[#202020]"
                  >
                    다시 시도
                  </button>
                )}
              </>
            )}
          </div>
        </PhonePreviewFrame>
      </div>
    </div>
  );
}

export default DashboardInvitationPreviewModal;
