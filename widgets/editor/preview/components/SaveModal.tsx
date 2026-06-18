import { useRouter } from 'next/navigation';
import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';

import {
  DASHBOARD_PENDING_INVITATION_KEY,
  type DashboardPendingInvitation,
} from '@/shared/constants/dashboardPendingInvitation';

import { SaveLottie } from './SaveLottie';

interface Props {
  isLoading: boolean;
  isFail: boolean;
  pendingInvitation: DashboardPendingInvitation | null;
  loadingMessage: string;
  retry: () => void;
  onClose: () => void;
}

const ModalFrame = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    isLoading?: boolean;
    loadingMessage?: string;
    onClose: () => void;
  }
>(({ children, isLoading, loadingMessage, onClose }, ref) => (
  <>
    <div
      className="fixed inset-0 z-[100] bg-[rgb(0_0_0_/_8%)]"
      onMouseDown={() => {
        if (!isLoading) onClose();
      }}
    />
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
      tabIndex={-1}
      className={`fixed top-1/2 left-1/2 z-[101] flex w-[335px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 rounded-xl border border-white/22 bg-white/72 p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%),0_1px_8px_-2px_rgb(255_255_255_/_35%)] backdrop-blur-xl ${isLoading ? 'justify-center' : ''}`}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <SaveLottie variant="loading" loop />
          <p className="min-h-5 text-sm font-semibold text-[#202020]">
            {loadingMessage}
          </p>
        </div>
      ) : (
        children
      )}
    </div>
  </>
));
ModalFrame.displayName = 'ModalFrame';

const SaveStepView = ({
  isFail,
  onRetry,
  onClose,
  onExit,
}: {
  isFail: boolean;
  onRetry: () => void;
  onClose: () => void;
  onExit: () => void;
}) => (
  <>
    <div>
      <p className="text-sm font-semibold">
        {isFail ? '파일 저장에 실패했습니다.' : '성공적으로 저장되었습니다!'}
      </p>
    </div>
    <div>
      <SaveLottie variant={isFail ? 'fail' : 'success'} />
    </div>
    <div className="flex items-center gap-2">
      {isFail ? (
        <button
          type="button"
          className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]"
          onClick={onRetry}
        >
          다시 저장하기
        </button>
      ) : (
        <>
          <button
            type="button"
            className="font-semibold text-sm border border-[#EAEAEA] rounded-lg bg-white text-black flex-center w-[143px] h-[44px] cursor-pointer transition-colors hover:bg-[#FAFAFB] active:bg-[#F5F8FF]"
            onClick={onClose}
          >
            다시 수정하기
          </button>
          <button
            type="button"
            className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[143px] h-[44px] cursor-pointer transition-colors hover:bg-[#202020] active:bg-[#0D0D0D]"
            onClick={onExit}
          >
            여기서 나가기
          </button>
        </>
      )}
    </div>
  </>
);

export const SaveModal = forwardRef<HTMLDivElement, Props>(
  (
    {
      isLoading,
      isFail,
      pendingInvitation,
      loadingMessage,
      retry,
      onClose,
    }: Props,
    ref
  ) => {
    const router = useRouter();

    const handleExit = () => {
      if (typeof window !== 'undefined' && pendingInvitation) {
        sessionStorage.setItem(
          DASHBOARD_PENDING_INVITATION_KEY,
          JSON.stringify(pendingInvitation)
        );
      }
      router.replace('/dashboard');
    };

    return createPortal(
      <ModalFrame
        ref={ref}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        onClose={onClose}
      >
        <SaveStepView
          isFail={isFail}
          onRetry={retry}
          onClose={onClose}
          onExit={handleExit}
        />
      </ModalFrame>,
      document.body
    );
  }
);

SaveModal.displayName = 'SaveModal';
