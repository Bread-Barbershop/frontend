import Image from 'next/image';
import React, { forwardRef, useState } from 'react';
import { createPortal } from 'react-dom';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useInvitationPublish } from '../hooks/useInvitationPublish';

interface Props {
  isLoading: boolean;
  isFail: boolean;
}
export const SaveModal = forwardRef<HTMLDivElement, Props>(
  ({ isLoading, isFail }: Props, ref) => {
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
      publishErrors,
      isPublish,
    } = useInvitationPublish({ invitationFolderId });

    const result = publishResults[invitationFolderId];
    const busy = Boolean(publishBusy[invitationFolderId]);
    const error = publishErrors[invitationFolderId];
    const finalGuestUrl =
      result?.guestUrl && result.guestUrl.startsWith('http')
        ? result.guestUrl
        : result?.guestUrl && origin
          ? `${origin}${result.guestUrl}`
          : (result?.guestUrl ?? null);
    return createPortal(
      <div
        ref={ref}
        className={`w-[335px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-[249px] rounded-xl backdrop-blur-sm bg-bg-base/12 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] flex flex-col items-center gap-6 ${isLoading ? 'justify-center' : ''}`}
      >
        {isLoading && <LoadingSpinner className="w-25 h-25 animate-spin" />}
        {!isLoading && (
          <>
            {isPublish ? (
              <>
                <div className="pt-5">
                  <p className="font-semibold text-sm">
                    {busy ? 'URL 발행중...' : '성공적으로 발행되었습니다!'}
                  </p>
                </div>
                <div>
                  {busy ? (
                    <LoadingSpinner className="w-25 h-25 animate-spin" />
                  ) : (
                    <Image
                      src="/images/saveSuccess.png"
                      alt="저장 성공 이미지"
                      width={100}
                      height={100}
                    />
                  )}
                </div>
                <div>
                  {busy ? (
                    <div className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]">
                      <span className="flex items-center">
                        발행중
                        <span className="ml-1 flex">
                          <span className="animate-bounce [animation-delay:-0.3s]">
                            .
                          </span>
                          <span className="animate-bounce [animation-delay:-0.15s]">
                            .
                          </span>
                          <span className="animate-bounce">.</span>
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="px-2 font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]">
                      {!finalGuestUrl || error ? (
                        <p>{error ?? '발행에 실패하였습니다.'}</p>
                      ) : (
                        <a
                          className="text-white truncate w-[215px]"
                          href={finalGuestUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {finalGuestUrl}
                        </a>
                      )}
                      {finalGuestUrl && (
                        <button
                          type="button"
                          className="text-[#38BDF8] text-[13px] font-semibold"
                          onClick={() => {
                            navigator.clipboard.writeText(finalGuestUrl);
                          }}
                        >
                          복사하기
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="pt-5">
                  <p className="font-semibold text-sm">
                    {isFail
                      ? '파일 저장에 실패하였습니다.'
                      : '성공적으로 저장되었습니다!'}
                  </p>
                </div>
                <div>
                  <Image
                    src="/images/saveSuccess.png"
                    alt="저장 성공 이미지"
                    width={100}
                    height={100}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]"
                    onClick={handlePublish}
                  >
                    초대장 URL 발행하기
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>,
      document.body
    );
  }
);
SaveModal.displayName = 'SaveModal';
