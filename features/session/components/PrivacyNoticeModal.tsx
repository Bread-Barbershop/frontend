'use client';

import { useState } from 'react';

type PrivacyNoticeModalProps = {
  open: boolean;
  onClose: () => void;
};

const FADE_OUT_MS = 180;

function PrivacyNoticeModal({ open, onClose }: PrivacyNoticeModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const closeWithFade = () => {
    if (isClosing) return;

    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, FADE_OUT_MS);
  };

  if (!open && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[rgb(0_0_0_/_8%)] transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={closeWithFade}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-[calc(100vw-40px)] rounded-xl border border-white/22 bg-white/72 p-5 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%),0_1px_8px_-2px_rgb(255_255_255_/_35%)] backdrop-blur-xl transition-all duration-200 ${
          isClosing ? 'scale-[0.98] opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={e => e.stopPropagation()}
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
    </div>
  );
}

export default PrivacyNoticeModal;
