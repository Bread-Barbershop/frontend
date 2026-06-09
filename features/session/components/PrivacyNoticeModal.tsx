'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type PrivacyNoticeModalProps = {
  open: boolean;
  onClose: () => void;
};

const FADE_OUT_MS = 180;

function PrivacyNoticeModal({ open, onClose }: PrivacyNoticeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const closeWithFade = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      if (dialogRef.current?.open) {
        dialogRef.current.close();
      }
      onClose();
      setIsClosing(false);
    }, FADE_OUT_MS);
  }, [isClosing, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && !isClosing && dialog.open) {
      dialog.close();
    }
  }, [open, isClosing]);

  if (!open && !isClosing) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`m-auto max-w-[calc(100vw-40px)] border-0 bg-transparent p-0 text-left outline-none backdrop:bg-[rgb(0_0_0_/_8%)] backdrop:transition-opacity backdrop:duration-200 ${
        isClosing ? 'backdrop:opacity-0' : 'backdrop:opacity-100'
      }`}
      aria-modal="true"
      onCancel={e => {
        e.preventDefault();
        closeWithFade();
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          closeWithFade();
        }
      }}
    >
      <div
        className={`max-w-[calc(100vw-40px)] rounded-xl shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%)] transition-all duration-200 ${
          isClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-black/5 bg-white p-5">
          <div className="w-fit max-w-full px-10 py-5 font-pretendard text-[14px] font-medium leading-5 text-[#121212]">
            <h2 className="mb-5 text-[32px] font-bold leading-10">
              안심하고 이용하세요
            </h2>
            <p className="mb-5">
              이 모바일 청첩장 프로젝트는 누구나 쉽게 사용할 수 있도록{' '}
              <span className="text-[#1F72EF]">무료로 제공</span>되고 있어요.
            </p>
            <ol className="mb-5 list-decimal space-y-1 pl-5">
              <li>
                초대장을 확인하기 위해 회원가입을 하거나 개인정보를 입력할
                필요가 없어요.
              </li>
              <li>
                이용자님의 이름, 연락처, 이메일 등의{' '}
                <span className="text-[#1F72EF]">
                  개인정보를 별도로 수집하거나 저장하지 않아요.
                </span>
              </li>
              <li>
                청첩장에 사용되는 사진과 자료는 이용자님의{' '}
                <span className="text-[#1F72EF]">
                  Google Drive 계정에 직접 업로드
                </span>
                되며, 직접 보관하고 관리할 수 있어요.
              </li>
            </ol>
            <p>
              앞으로도 소중한 순간을 더욱 간편하고 안전하게 공유할 수 있도록
              노력할게요.
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default PrivacyNoticeModal;
