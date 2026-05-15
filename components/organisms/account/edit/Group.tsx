import { UtilityButton } from '@/components/atoms/button';
import { ActionField } from '@/components/molecules/action-field';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { MultiField } from '@/components/molecules/multi-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';

interface Props {
  groupIndex: number;
  groupName: string;
  accountList: {
    name: string;
    bank: string;
    account: string;
    kakao: boolean;
  }[];
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
  onOpenGroupPopup: () => void;
}

export const Group = ({
  handleUpdateBlock,
  groupIndex,
  groupName,
  accountList,
  onOpenGroupPopup,
}: Props) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {groupIndex === 0 ? (
        <NavigationBar
          action={
            <UtilityButton
              size="md"
              variant="primary"
              onClick={onOpenGroupPopup}
            >
              그룹편집
            </UtilityButton>
          }
          direction="right"
          className="w-full"
        >
          {`${groupIndex + 1}번 그룹`}
        </NavigationBar>
      ) : (
        <NavigationBar>{`${groupIndex + 1}번 그룹`}</NavigationBar>
      )}

      <ActionField
        className="mb-2 text-center"
        label="그룹명"
        inputProps={{
          placeholder: '그룹명',
          value: groupName,
          onChange: e =>
            handleUpdateBlock(`groupList.${groupIndex}.name`, e.target.value),
        }}
        buttonProps={{
          children: '계좌추가',
          variant: 'bordered',
          size: 'sm',
          onClick: () => {
            const newAccounts = [
              ...accountList,
              { name: '', bank: '', account: '', kakao: false },
            ];
            handleUpdateBlock(`accountList.${groupIndex}`, newAccounts);
          },
        }}
      />
      {accountList.map((account, i) => (
        <div key={`${i}`} className="flex flex-col gap-3.5">
          <TextField
            label="예금주"
            inputProps={{
              placeholder: '예금주명',
              value: account.name,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.name`,
                  e.target.value
                ),
            }}
            className="w-full text-center"
          />
          <MultiField
            label={`${i + 1}번 계좌`}
            className="w-full"
            subInputProps={{
              placeholder: '은행',
              className: 'w-[65px]',
              value: account.bank,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.bank`,
                  e.target.value
                ),
            }}
            mainInputProps={{
              placeholder: '계좌번호',
              className: 'w-[173px]',
              value: account.account,
              onChange: e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.account`,
                  e.target.value
                ),
            }}
          />
          <div className="flex items-center gap-2 w-full">
            <p className="text-sm font-semibold px-1 select-none">추가기능</p>
            <Checkbox
              aria-label="간편 송금(카카오페이)"
              direction="right"
              checked={account.kakao || false}
              onChange={e =>
                handleUpdateBlock(
                  `accountList.${groupIndex}.${i}.kakao`,
                  e.target.checked
                )
              }
            >
              간편 송금(카카오페이)
            </Checkbox>
          </div>
        </div>
      ))}
    </div>
  );
};
