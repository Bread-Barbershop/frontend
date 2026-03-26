import Image from 'next/image';
import React from 'react';
import { createPortal } from 'react-dom';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';

interface Props {
  isLoading: boolean;
  isFail: boolean;
}
function SaveModal({ isLoading, isFail }: Props) {
  return createPortal(
    <div
      className={`w-[335px] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-[249px] rounded-xl backdrop-blur-sm bg-bg-base/12 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.12),0_8px_24px_-8px_rgba(0,0,0,0.18),0_1px_8px_-2px_rgba(255,255,255,0.35)] flex flex-col items-center gap-6 ${isLoading ? 'justify-center' : ''}`}
    >
      {isLoading && <LoadingSpinner className="w-25 h-25 animate-spin" />}
      {!isLoading && (
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
            >
              초대장 URL 발행하기
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

export default SaveModal;
