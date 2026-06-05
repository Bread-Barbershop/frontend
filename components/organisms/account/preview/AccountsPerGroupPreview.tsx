import { AnimatePresence, motion } from 'framer-motion';

import { openAccountApp } from '@/app/api/account/openAccountApp';
import { Button } from '@/components/atoms/button';
import CopyIcon from '@/shared/assets/icons/copy.svg';
import KakaoIcon from '@/shared/assets/icons/kakao.svg';
import { useToast } from '@/shared/hooks/useToast';

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
  const { success: successToast } = useToast();

  const handleCopyAccount = async (bank: string, account: string) => {
    try {
      await copyTextToClipboard(`${bank} ${account}`);
      successToast('복사가 완료되었어요!');
      return true;
    } catch (error) {
      console.error('copy failed:', error);
      return false;
    }
  };

  const handleOpenKakao = () => {
    openAccountApp();
  };

  return (
    <AnimatePresence initial={false}>
      {isOpenAccount && (
        <motion.div
          key="account-list"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-2 pb-[11px] pt-2">
            {accountList.map((account: Account, j: number) => {
              const displayName = account.name.trim() || '예금주';
              const displayBank = account.bank.trim() || '은행';
              const displayAccount = account.account.trim() || '000-000-000000';

              return (
                <div
                  key={j}
                  className="flex min-h-13 w-full shrink-0 items-center gap-2 pl-3 pr-2"
                >
                  <div className="flex h-full w-full flex-col justify-center text-start">
                    <p className="text-[13px] text-start font-semibold text-border-liner">
                      {displayName}
                    </p>
                    <p className="text-[13px] font-normal text-border-liner">
                      {displayBank}
                    </p>
                    <p className="text-[13px] font-normal text-border-liner">
                      {displayAccount}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-start gap-0.5">
                    <Button
                      type="button"
                      variant="borderless"
                      className="size-11 flex-center"
                      onClick={() =>
                        handleCopyAccount(displayBank, displayAccount)
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
                            displayBank,
                            displayAccount
                          );
                          if (success) handleOpenKakao();
                        }}
                      >
                        <KakaoIcon width={36} height={36} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
