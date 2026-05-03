import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { openAccountApp } from '@/app/api/account/openAccountApp';
import { Button } from '@/components/atoms/button';
import CopyIcon from '@/shared/assets/icons/copy.svg';
import KakaoIcon from '@/shared/assets/icons/kakao.svg';

type Account = {
  name: string;
  bank: string;
  account: string;
  kakao: boolean;
};

const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const isCopied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!isCopied) {
    throw new Error('Failed to copy account text');
  }
};

export const AccountsPerGroupPreview = ({
  isOpenAccount,
  accountList,
}: {
  isOpenAccount: boolean;
  accountList: Account[];
}) => {
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCopyToastVisible, setIsCopyToastVisible] = useState(false);
  const [copyToastKey, setCopyToastKey] = useState(0);

  useEffect(() => {
    if (copyToastKey === 0) return;

    const fadeTimer = window.setTimeout(() => {
      setIsCopyToastVisible(false);
    }, 1500);
    const unmountTimer = window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [copyToastKey]);

  const handleCopyAccount = async (bank: string, account: string) => {
    try {
      await copyTextToClipboard(`${bank} ${account}`);
      setShowCopyToast(true);
      setIsCopyToastVisible(true);
      setCopyToastKey(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('copy failed:', error);
      return false;
    }
  };

  const handleOpenKakao = () => {
    openAccountApp();
  };

  const copyToast =
    showCopyToast && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`fixed left-1/2 top-[calc(env(safe-area-inset-top)+16px)] z-[9999] -translate-x-1/2 transition-opacity duration-500 ${
              isCopyToastVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-fit whitespace-nowrap rounded-xl bg-white p-5 text-center text-sm font-semibold text-text-primary shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_24px_60px_-20px_rgba(0,0,0,0.12)]">
              복사가 완료되었어요!
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {copyToast}
      {isOpenAccount && (
        <div className="flex flex-col gap-2 pb-[11px] pt-2">
          {accountList.map((account: Account, j: number) => (
            <div
              key={j}
              className="flex min-h-13 w-full shrink-0 items-center gap-2 pl-3 pr-2"
            >
              <div className="flex h-full w-full flex-col justify-center text-start">
                <p className="text-[13px] text-start font-semibold text-border-liner">
                  {account.name}
                </p>
                <p className="text-[13px] font-normal text-border-liner">
                  {account.bank}
                </p>
                <p className="text-[13px] font-normal text-border-liner">
                  {account.account}
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-start gap-0.5">
                <Button
                  type="button"
                  variant="borderless"
                  className="size-11 flex-center"
                  onClick={() =>
                    handleCopyAccount(account.bank, account.account)
                  }
                >
                  <CopyIcon />
                </Button>
                {account.kakao === true && (
                  <Button
                    type="button"
                    variant="borderless"
                    className="size-11 flex-center"
                    onClick={async () => {
                      const success = await handleCopyAccount(
                        account.bank,
                        account.account
                      );
                      if (success) handleOpenKakao();
                    }}
                  >
                    <KakaoIcon width={36} height={36} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
