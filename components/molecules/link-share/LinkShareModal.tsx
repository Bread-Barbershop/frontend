'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useBackdropDismiss } from '@/shared/hooks/useBackdropDismiss';
import {
  disableBodyScroll,
  getHiddenRoot,
  removeHiddenRoot,
  trapFocus,
} from '@/shared/utils/focusTrap';

type LinkShareModalProps = {
  url: string;
  recipient?: string;
  notice?: string;
  onClose: () => void;
};

type QrResult = {
  url: string;
  attempt: number;
  dataUrl: string | null;
};

export function LinkShareModal({
  url,
  recipient,
  notice,
  onClose,
}: LinkShareModalProps) {
  const titleId = useId();
  const backdropDismiss = useBackdropDismiss<HTMLDivElement>(onClose);
  const modalRef = useRef<HTMLDivElement>(null);
  const shareUrl = new URL(url, window.location.origin).href;
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [copyStatus, setCopyStatus] = useState<
    'idle' | 'copying' | 'copied' | 'failed'
  >('idle');
  const currentQr =
    qrResult?.url === shareUrl && qrResult.attempt === attempt
      ? qrResult
      : null;

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      try {
        const { toDataURL } = await import('qrcode');
        const dataUrl = await toDataURL(shareUrl, {
          width: 1024,
          margin: 4,
          errorCorrectionLevel: 'M',
        });

        if (!cancelled) setQrResult({ url: shareUrl, attempt, dataUrl });
      } catch {
        if (!cancelled) {
          setQrResult({ url: shareUrl, attempt, dataUrl: null });
        }
      }
    }

    void generateQr();
    return () => {
      cancelled = true;
    };
  }, [shareUrl, attempt]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const restoreScroll = disableBodyScroll();
    getHiddenRoot();
    modalRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (modalRef.current) {
        trapFocus(event, modalRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreScroll();
      removeHiddenRoot();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  const handleCopy = async () => {
    setCopyStatus('copying');
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 p-4"
      {...backdropDismiss}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[calc(100dvh-32px)] w-[335px] max-w-full flex-col items-center gap-5 overflow-y-auto rounded-xl bg-white p-5 shadow-xl outline-none"
      >
        <div className="text-center">
          <h2 id={titleId} className="text-base font-semibold text-[#202020]">
            링크와 QR로 공유하기
          </h2>
          <p className="mt-2 break-words text-sm text-gray-600">
            {recipient ?? '링크를 보내거나 QR을 스캔해 초대장을 열 수 있어요.'}
          </p>
        </div>
        {notice && (
          <p className="w-full rounded-lg bg-gray-50 p-3 text-center text-xs leading-5 text-gray-600">
            {notice}
          </p>
        )}
        <div className="flex size-[224px] shrink-0 items-center justify-center bg-white">
          {currentQr?.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentQr.dataUrl}
              alt="초대장 공유 QR 코드"
              width={224}
              height={224}
            />
          ) : currentQr ? (
            <div className="text-center text-sm">
              <p role="alert">QR을 만들지 못했어요.</p>
              <button
                type="button"
                className="mt-3 cursor-pointer underline underline-offset-4"
                onClick={() => setAttempt(value => value + 1)}
              >
                QR 다시 만들기
              </button>
            </div>
          ) : (
            <p role="status" className="text-sm text-gray-500">
              QR을 만들고 있어요.
            </p>
          )}
        </div>
        <div className="w-full">
          <label htmlFor={`${titleId}-url`} className="text-xs text-gray-500">
            초대장 링크
          </label>
          <input
            id={`${titleId}-url`}
            type="text"
            readOnly
            value={shareUrl}
            onFocus={event => event.currentTarget.select()}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={copyStatus === 'copying'}
              className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg bg-black text-sm font-semibold text-white hover:bg-[#202020] disabled:cursor-wait disabled:opacity-60"
            >
              {copyStatus === 'copied' ? '복사 완료' : '링크 복사하기'}
            </button>
            {currentQr?.dataUrl ? (
              <a
                href={currentQr.dataUrl}
                download="invitation-qr.png"
                className="flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
              >
                QR 저장하기
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="h-11 flex-1 rounded-lg border border-gray-200 text-sm font-semibold text-gray-400"
              >
                QR 저장하기
              </button>
            )}
          </div>
          {copyStatus === 'copied' && (
            <p role="status" className="mt-2 text-center text-xs text-gray-500">
              링크를 복사했어요.
            </p>
          )}
          {copyStatus === 'failed' && (
            <p role="alert" className="mt-2 text-center text-xs text-red-600">
              링크를 복사하지 못했어요. 위 링크를 직접 복사해 주세요.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-full shrink-0 cursor-pointer rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
}
