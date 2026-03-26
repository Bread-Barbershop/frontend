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

export const AccountsPerGroupPreview = ({
  isOpenAccount,
  accountList,
}: {
  isOpenAccount: boolean;
  accountList: Account[];
}) => {
  const handleCopyAccount = async (bank: string, account: string) => {
    try {
      await navigator.clipboard.writeText(`${bank} ${account}`);
      return true;
    } catch (error) {
      console.error('복사 실패:', error);
      return false;
    }
  };
  const handleOpenKakao = () => {
    openAccountApp();
  };

  return (
    <div className="flex flex-col gap-2">
      {isOpenAccount &&
        accountList.map((account: Account, j: number) => (
          <div key={j} className="flex items-center gap-2 w-full">
            <Button
              type="button"
              variant="borderless"
              className="w-8"
              onClick={() => handleCopyAccount(account.bank, account.account)}
            >
              <CopyIcon />
            </Button>
            <div className="w-full">
              <p className="text-sm text-start font-semibold text-border-liner">
                {account.name}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-border-liner">
                  {account.bank}
                </p>
                <p className="text-sm font-semibold text-border-liner">
                  {account.account}
                </p>
              </div>
            </div>
            {account.kakao === true && (
              <Button
                type="button"
                variant="borderless"
                className="w-10"
                onClick={async () => {
                  const success = await handleCopyAccount(
                    account.bank,
                    account.account
                  );
                  if (success) handleOpenKakao();
                }}
              >
                <KakaoIcon />
              </Button>
            )}
          </div>
        ))}
    </div>
  );
};
