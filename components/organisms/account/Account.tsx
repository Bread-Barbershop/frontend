import { JSONContent } from '@tiptap/react';
import { useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/atoms/button/Button';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { Popup } from '../popup/Popup';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Group } from './edit/Group';
import { GroupEdit } from './edit/GroupEdit';

interface Props {
  blockInfo: EditorBlock<'account'>;
  id: string;
}

interface AccountType {
  name: string;
  bank: string;
  account: string;
  kakao: boolean;
}

export const Account = ({ blockInfo, id }: Props) => {
  const { updateBlock } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
    }))
  );
  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false);
  const groupPopupTriggerRef = useRef<HTMLDivElement>(null);
  const { title, checkedEnglishTitle, englishTitle } = blockInfo.props;

  const handleUpdateBlock = (
    key: string,
    value:
      | string
      | number
      | boolean
      | { name: string }[]
      | { name: string; bank: string; account: string; kakao: boolean }[]
      | { name: string; bank: string; account: string; kakao: boolean }[][]
  ) => {
    const keys = key.split('.');

    // 계좌 세부 필드 업데이트
    if (keys.length === 4 && keys[0] === 'accountList') {
      const [, groupIdx, accountIdx, field] = keys;
      const newAccountList = [...blockInfo.props.accountList];
      const newGroupAccounts = [...newAccountList[Number(groupIdx)]];
      newGroupAccounts[Number(accountIdx)] = {
        ...newGroupAccounts[Number(accountIdx)],
        [field]: value,
      };
      newAccountList[Number(groupIdx)] = newGroupAccounts;
      updateBlock(id, { accountList: newAccountList });
      return;
    }

    // 전체 계좌 업데이트
    if (keys.length === 2 && keys[0] === 'accountList') {
      const [, groupIdx] = keys;
      const newAccountList = [...blockInfo.props.accountList];
      newAccountList[Number(groupIdx)] = value as AccountType[];
      updateBlock(id, { accountList: newAccountList });
      return;
    }

    // 그룹명 업데이트
    if (keys.length === 3 && keys[0] === 'groupList') {
      const [, index, field] = keys;
      const newGroupList = [...blockInfo.props.groupList];
      newGroupList[Number(index)] = {
        ...newGroupList[Number(index)],
        [field]: value as string,
      };
      updateBlock(id, { groupList: newGroupList });
      return;
    }

    updateBlock(id, { [key]: value });
  };

  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
  };

  const handleAddGroup = () => {
    const nextGroupList = [...blockInfo.props.groupList, { name: '' }];
    const nextAccountList = [
      ...blockInfo.props.accountList,
      [{ name: '', bank: '', account: '', kakao: false }],
    ];

    handleUpdateBlock('groupList', nextGroupList);
    handleUpdateBlock('accountList', nextAccountList);
  };

  return (
    <LeftEditorWrapper ariaLabel="계좌번호">
      <NavigationBar>계좌번호 편집 페이지</NavigationBar>

      <TextField
        label="제목"
        inputProps={{
          placeholder: '마음 보내실 곳',
          value: title === '마음 보내실 곳' ? '' : title,
          onChange: e =>
            handleUpdateBlock('title', e.target.value || '마음 보내실 곳'),
        }}
        className="w-full text-center"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'ACCOUNT',
            value: englishTitle === 'ACCOUNT' ? '' : englishTitle,
            onChange: e =>
              handleUpdateBlock(
                'englishTitle',
                sanitizeEnglishTitleInput(e.target) || 'ACCOUNT'
              ),
          }}
          className="text-center w-full pt-3"
        />
      )}

      <NavigationBar>내용</NavigationBar>

      <TextEditor
        key={`${id}`}
        value={blockInfo.props.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />
      <section className="flex flex-row gap-2 items-center w-full">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          onChange={e =>
            handleUpdateBlock('checkedEnglishTitle', e.target.checked)
          }
          checked={checkedEnglishTitle}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </section>

      {Array.from({ length: blockInfo.props.groupList.length }).map((_, i) => (
        <Group
          key={i}
          groupIndex={i}
          groupName={blockInfo.props.groupList[i].name}
          accountList={blockInfo.props.accountList[i]}
          handleUpdateBlock={handleUpdateBlock}
          onOpenGroupPopup={() => setIsGroupPopupOpen(true)}
          groupPopupTriggerRef={groupPopupTriggerRef}
        />
      ))}
      <Button
        size="md"
        variant="borderless"
        onClick={handleAddGroup}
        className="text-primary"
      >
        + 그룹 추가
      </Button>
      {isGroupPopupOpen && (
        <Popup
          popupTitle="그룹 편집"
          variant="floating"
          onClose={() => setIsGroupPopupOpen(false)}
          wrapperClassName="w-[200px] pt-1 pb-4"
          hideCloseButton
          triggerRef={groupPopupTriggerRef}
        >
          <GroupEdit
            handleUpdateBlock={handleUpdateBlock}
            totalAccountList={blockInfo.props.accountList}
            totalGroupList={blockInfo.props.groupList}
          />
        </Popup>
      )}
    </LeftEditorWrapper>
  );
};
