import Image from 'next/image';
import React, { forwardRef, useState } from 'react';
import { createPortal } from 'react-dom';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useInvitationPublish } from '../hooks/useInvitationPublish';

interface Props {
  isLoading: boolean;
  isFail: boolean;
  retry: () => void;
  onClose: () => void;
}

// 1. 공통 모달 프레임
const ModalFrame = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    isLoading?: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
    onClose: () => void;
  }
>(({ children, isLoading, onMouseDown, onClose }, ref) => (
  <>
    <div
      className="fixed inset-0 z-40 bg-black/20"
      onMouseDown={e => {
        onMouseDown?.(e);
        if (!isLoading) onClose();
      }}
    />
    <div
      ref={ref}
      className={`w-[335px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-[249px] rounded-xl backdrop-blur-sm bg-bg-base/12 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] flex flex-col items-center gap-8 ${isLoading ? 'justify-center' : ''}`}
    >
      {isLoading ? (
        <LoadingSpinner className="w-[84px] h-[84px] animate-spin" />
      ) : (
        children
      )}
    </div>
  </>
));
ModalFrame.displayName = 'ModalFrame';

// 2. 저장 결과 단계 뷰
const SaveStepView = ({
  isFail,
  onPublish,
  onUpload,
  onClose,
}: {
  isFail: boolean;
  onPublish: () => void;
  onUpload: () => void;
  onClose: () => void;
}) => (
  <>
    <div className="pt-5">
      <p className="font-semibold text-base">
        {isFail ? '파일 저장에 실패했습니다.' : '성공적으로 저장되었습니다!'}
      </p>
    </div>
    <div>
      <Image
        src={isFail ? '/images/saveFail.png' : '/images/saveSuccess.png'}
        alt={isFail ? '저장 실패 이미지' : '저장 성공 이미지'}
        width={84}
        height={84}
      />
    </div>
    <div className="flex items-center gap-2">
      {isFail ? (
        <button
          type="button"
          className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]"
          onClick={onUpload}
        >
          다시 저장하기
        </button>
      ) : (
        <>
          <button
            type="button"
            className="font-semibold text-sm border border-white/12 rounded-lg bg-white text-black flex-center w-[143px] h-[44px]"
            onClick={onClose}
          >
            다시 수정하기
          </button>
          <button
            type="button"
            className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[143px] h-[44px]"
            onClick={onPublish}
          >
            초대장 URL 만들기
          </button>
        </>
      )}
    </div>
  </>
);

// 3. 발행 상태 단계 뷰
const PublishStepView = ({
  busy,
  error,
  readinessBusy,
  statusMessage,
  finalGuestUrl,
  onPublish,
}: {
  busy: boolean;
  error: string | null;
  readinessBusy: boolean;
  statusMessage: string;
  finalGuestUrl: string | null;
  onPublish: () => void;
}) => (
  <>
    <div className="pt-5">
      <p className="font-semibold text-base">{statusMessage}</p>
    </div>
    <div>
      {busy || readinessBusy ? (
        <LoadingSpinner className="w-[84px] h-[84px] animate-spin" />
      ) : error ? (
        <Image
          src="/images/saveFail.png"
          alt="저장 실패 이미지"
          width={84}
          height={84}
        />
      ) : (
        <Image
          src="/images/saveSuccess.png"
          alt="저장 성공 이미지"
          width={84}
          height={84}
        />
      )}
    </div>
    <div>
      {busy ? (
        <div className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]">
          <span className="flex items-center">
            발행중
            <span className="ml-1 flex">
              <span className="animate-bounce [animation-delay:-0.3s]">.</span>
              <span className="animate-bounce [animation-delay:-0.15s]">.</span>
              <span className="animate-bounce">.</span>
            </span>
          </span>
        </div>
      ) : (
        <div className="px-2 font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px] gap-1">
          {!finalGuestUrl || error ? (
            <button
              type="button"
              className="text-white truncate w-[215px] hover:bg-white/30 rounded-lg p-1"
              onClick={onPublish}
            >
              초대장 URL 다시 발행하기
            </button>
          ) : (
            <>
              <a
                className="text-white truncate w-[215px] hover:bg-white/30 rounded-lg p-1"
                href={finalGuestUrl}
                target="_blank"
                rel="noreferrer"
              >
                {finalGuestUrl}
              </a>
              <button
                type="button"
                className="text-[#38BDF8] text-[13px] font-semibold px-1 py-2 hover:bg-white/30 rounded-lg"
                onClick={e => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(finalGuestUrl);
                  alert('복사되었습니다.');
                }}
              >
                복사하기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  </>
);

export const SaveModal = forwardRef<HTMLDivElement, Props>(
  ({ isLoading, isFail, retry, onClose }: Props, ref) => {
    const invitationFolderId = useEditorStore(
      state => state.invitationFolderId
    );
    const [origin] = useState(() =>
      typeof window !== 'undefined' ? window.location.origin : ''
    );
    const {
      handlePublish,
      publishResults,
      publishBusy,
      readinessPolling,
      publishErrors,
      isPublish,
    } = useInvitationPublish({ invitationFolderId });

    const result = publishResults[invitationFolderId];
    const busy = Boolean(publishBusy[invitationFolderId]);
    const readinessBusy = Boolean(readinessPolling[invitationFolderId]);
    const error = publishErrors[invitationFolderId];
    const isReadyPending = !error && result?.ready === false;
    const finalGuestUrl =
      result?.guestUrl && result.guestUrl.startsWith('http')
        ? result.guestUrl
        : result?.guestUrl && origin
          ? `${origin}${result.guestUrl}`
          : (result?.guestUrl ?? null);

    const getStatusMessage = () => {
      if (busy) return 'URL 발행중...';
      if (error) return 'URL 발행에 실패했습니다.';
      if (readinessBusy) return 'URL 발행 완료, 반영 중입니다.';
      if (isReadyPending) return 'URL 발행 완료, 반영 지연 중입니다.';
      return '성공적으로 발행되었습니다.';
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isLoading || busy || readinessBusy) {
        e.stopPropagation();
      }
    };

    return createPortal(
      <ModalFrame
        ref={ref}
        isLoading={isLoading}
        onMouseDown={handleMouseDown}
        onClose={onClose}
      >
        {isPublish ? (
          <PublishStepView
            busy={busy}
            error={error}
            readinessBusy={readinessBusy}
            statusMessage={getStatusMessage()}
            finalGuestUrl={finalGuestUrl}
            onPublish={handlePublish}
          />
        ) : (
          <SaveStepView
            isFail={isFail}
            onPublish={handlePublish}
            onUpload={retry}
            onClose={onClose}
          />
        )}
      </ModalFrame>,
      document.body
    );
  }
);

SaveModal.displayName = 'SaveModal';
