'use client';

import { useCallback, useState } from 'react';

import PrivacyNoticeModal from './PrivacyNoticeModal';

const HEADER_PRIVACY_BUTTON_CLASS =
  'h-full px-2 flex items-center text-[14px] font-semibold text-[#121212] cursor-pointer';

function HeaderPrivacyNoticeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={HEADER_PRIVACY_BUTTON_CLASS}
      >
        개인정보 걱정 없어요.
      </button>
      <PrivacyNoticeModal open={isOpen} onClose={handleClose} />
    </>
  );
}

export default HeaderPrivacyNoticeButton;
