import { Button } from '@/components/atoms/button';

export const GroupEdit = ({
  handleUpdateBlock,
  totalGroupList,
  totalAccountList,
}: {
  handleUpdateBlock: (
    key: string,
    value:
      | string
      | number
      | boolean
      | { name: string }[]
      | { name: string; bank: string; account: string; kakao: boolean }[]
      | { name: string; bank: string; account: string; kakao: boolean }[][]
  ) => void;
  totalGroupList: { name: string }[];
  totalAccountList: {
    name: string;
    bank: string;
    account: string;
    kakao: boolean;
  }[][];
}) => {
  const handleDeleteGroup = (groupIndex: number) => {
    if (totalGroupList.length <= 1) return;

    const nextGroupList = [...totalGroupList];
    nextGroupList.splice(groupIndex, 1);

    const nextAccountList = [...totalAccountList];
    nextAccountList.splice(groupIndex, 1);

    handleUpdateBlock('groupList', nextGroupList);
    handleUpdateBlock('accountList', nextAccountList);
  };

  const handleDeleteAccount = (groupIndex: number, accountIndex: number) => {
    if (totalAccountList[groupIndex].length <= 1) return;

    const nextGroupAccounts = [...totalAccountList[groupIndex]];
    nextGroupAccounts.splice(accountIndex, 1);

    const nextAccountList = [...totalAccountList];
    nextAccountList[groupIndex] = nextGroupAccounts;

    handleUpdateBlock('accountList', nextAccountList);
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {totalAccountList.map((group, i) => (
        <div key={i} className="flex flex-col gap-2 items-start w-full">
          <div className="flex items-center justify-between w-full select-none">
            <p className="text-text-primary text-sm font-semibold">
              {i + 1}번 그룹
            </p>
            {totalGroupList.length > 1 && (
              <Button
                size="sm"
                variant="borderless"
                onClick={() => handleDeleteGroup(i)}
                type="button"
                className="text-btn-close flex items-center px-2 justify-end w-fit"
              >
                삭제
              </Button>
            )}
          </div>
          <div className="border-l border-text-secondary ml-2 pl-2 w-full">
            {group.map((account, j) => (
              <div key={j} className="flex items-center justify-between h-8">
                <p className="text-text-secondary font-semibold text-xs">
                  {account.name || '예금주'} {j + 1}번
                </p>
                <Button
                  size="sm"
                  variant="borderless"
                  onClick={() => handleDeleteAccount(i, j)}
                  type="button"
                  className={`${j + 1 === 1 ? 'hidden' : ' text-btn-close flex items-center pr-4 justify-end w-fit'}`}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
