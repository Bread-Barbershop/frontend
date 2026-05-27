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
        className={`max-w-[calc(100vw-40px)] rounded-xl border border-white/22 bg-white/72 p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%),0_1px_8px_-2px_rgb(255_255_255_/_35%)] backdrop-blur-xl transition-all duration-200 ${
          isClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="p-10 text-[14px] font-semibold leading-[1.65] text-[#121212]">
          이 사이트는 초대장을 확인하는 과정에서 사용자의 이름, 연락처,
          이메일 등 개인을 식별할 수 있는 정보를 수집하거나 저장하지
          않습니다.
          <br />
          <br />
          별도의 회원가입이나 개인정보 입력 없이 초대장을 확인할 수 있으며,
          사용자의 개인정보를 광고, 마케팅, 분석 목적으로 이용하지 않습니다.
        </div>
      </div>
    </dialog>
  );
}

export default PrivacyNoticeModal;
