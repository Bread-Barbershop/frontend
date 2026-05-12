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
    return createPortal(
      <>
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onMouseDown={e => {
            if (isLoading || busy || readinessBusy) {
              e.stopPropagation();
            }
          }}
        />
        <div
          ref={ref}
          className={`w-[335px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-[249px] rounded-xl backdrop-blur-sm bg-bg-base/12 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] flex flex-col items-center gap-8 ${isLoading ? 'justify-center' : ''}`}
        >
          {isLoading && (
            <LoadingSpinner className="w-[84px] h-[84px] animate-spin" />
          )}
          {!isLoading && (
            <>
              {isPublish ? (
                <>
                  <div className="pt-5">
                    <p className="font-semibold text-base">
                      {busy
                        ? 'URL 발행중...'
                        : error
                          ? 'URL 발행에 실패하였습니다.'
const getStatusMessage = () => {
  if (busy) return 'URL 발행중...';
  if (error) return 'URL 발행에 실패하였습니다.';
  if (readinessBusy) return 'URL 발행 완료, 반영 중입니다.';
  if (isReadyPending) return 'URL 발행 완료, 반영 지연 중입니다.';
  return '성공적으로 발행되었습니다.';
};

<p className="font-semibold text-base">
  {getStatusMessage()}
</p>
                    </p>
                  </div>
                  <div>
                    {busy ? (
                      <LoadingSpinner className="w-[84px] h-[84px] animate-spin" />
                    ) : error ? (
                      <Image
                        src="/images/saveFail.png"
                        alt="저장 실패 이미지"
                        width={84}
                        height={84}
                      />
                    ) : readinessBusy ? (
                      <LoadingSpinner className="w-[84px] h-[84px] animate-spin" />
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
                      <div className="px-2 font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px] gap-1">
                        {!finalGuestUrl || error ? (
                          <button
                            type="button"
                            className="text-white truncate w-[215px] hover:bg-white/30 rounded-lg p-1"
                            onClick={handlePublish}
                          >
                            초대장 URL 다시 발행하기
                          </button>
                        ) : (
                          <a
                            className="text-white truncate w-[215px] hover:bg-white/30 rounded-lg p-1"
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
                            className="text-[#38BDF8] text-[13px] font-semibold px-1 py-2 hover:bg-white/30 rounded-lg"
                            onClick={e => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(finalGuestUrl);
                              alert('복사되었습니다!');
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
                    <p className="font-semibold text-base">
                      {isFail
                        ? '파일 저장에 실패하였습니다.'
                        : '성공적으로 저장되었습니다!'}
                    </p>
                  </div>
                  {isFail ? (
                    <div>
                      <Image
                        src="/images/saveFail.png"
                        alt="저장 실패 이미지"
                        width={84}
                        height={84}
                      />
                    </div>
                  ) : (
                    <div>
                      <Image
                        src="/images/saveSuccess.png"
                        alt="저장 성공 이미지"
                        width={84}
                        height={84}
                      />
                    </div>
                  )}

                  <div>
                    {isFail ? (
                      <div className="font-semibold text-sm border border-white/12 rounded-lg bg-black/50 text-white/70 flex-center w-[295px] h-[44px]">
                        저장 후 URL을 발행할 수 있습니다.
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="font-semibold text-sm border border-white/12 rounded-lg bg-black text-white flex-center w-[295px] h-[44px]"
                        onClick={handlePublish}
                      >
                        초대장 URL 발행하기
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </>,
      document.body
    );
  }
);
SaveModal.displayName = 'SaveModal';
