'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect } from 'react';

type PrivacyNoticeModalProps = {
  open: boolean;
  onClose: () => void;
  variant?: 'default' | 'mobileHome';
};

function PrivacyNoticeModal({
  open,
  onClose,
  variant = 'default',
}: PrivacyNoticeModalProps) {
  const isMobileHome = variant === 'mobileHome';

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[50000] flex items-center justify-center px-5 ${
            isMobileHome
              ? 'bg-[rgb(0_0_0_/_16%)]'
              : 'bg-[rgb(0_0_0_/_8%)]'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="max-w-[calc(100vw-40px)] rounded-xl text-left shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
          >
            <div
              className={`flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border border-black/5 bg-white ${
                isMobileHome ? 'px-5 pb-2.5 pt-[24px]' : 'p-5'
              }`}
            >
              <div
                className={`w-fit max-w-full font-pretendard font-medium text-text-plain ${
                  isMobileHome
                    ? 'px-0 py-0 text-[13px] leading-[18px]'
                    : 'px-10 py-5 text-[14px] leading-5'
                }`}
              >
                <h2
                  className={
                    isMobileHome
                      ? 'mb-5 text-center text-[20px] font-bold leading-7'
                      : 'mb-5 text-[32px] font-bold leading-10'
                  }
                >
                  {isMobileHome ? '안심하고 이용하세요.' : '안심하고 이용하세요'}
                </h2>
                <p className="mb-5">
                  이 모바일 청첩장 프로젝트는 누구나 쉽게 사용할 수 있도록{' '}
                  <span className="text-[#1F72EF]">무료로 제공</span>되고
                  있어요.
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
                  앞으로도 소중한 순간을 더욱 간편하고 안전하게 공유할 수
                  있도록 노력할게요.
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-white px-8 py-[13.5px] font-pretendard text-[14px] font-semibold leading-5 text-text-plain transition-colors hover:bg-[#FAFAFB] active:bg-[#F5F8FF]"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 12%)',
                }}
                onClick={handleClose}
              >
                알겠어요.
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PrivacyNoticeModal;
