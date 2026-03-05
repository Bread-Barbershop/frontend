import { JSONContent } from '@tiptap/react';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import PopupOptions from '../popup/PopupOptions';

import { ACCOUNT_SAMPLE_MESSAGES } from './accountSampleMessages';
import { Group } from './edit/Group';

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

function createParagraphJson(text: string): JSONContent {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  return {
    type: 'doc',
    content: lines.map(line =>
      line.length === 0
        ? {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
          }
        : {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
            content: [{ type: 'text', text: line }],
          }
    ),
  };
}

export const Account = ({ blockInfo, id }: Props) => {
  const [isSamplePopupOpen, setIsSamplePopupOpen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const { updateBlock } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
    }))
  );

  const debouncedUpdateMessage = useMemo(
    () =>
      debounce((messageJson: JSONContent) => {
        updateBlock(id, {
          messageJson,
          messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);

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
    debouncedUpdateMessage(json);
  };

  const handleSampleSelect = (text: string) => {
    debouncedUpdateMessage.cancel();
    const messageJson = createParagraphJson(text);
    updateBlock(id, {
      messageJson,
      messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
    });
    setEditorResetKey(prev => prev + 1);
    setIsSamplePopupOpen(false);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-1 px-5 py-3.5 w-93.75 min-h-65 max-h-200 overflow-y-scroll">
      <NavigationBar>계좌번호</NavigationBar>

      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: blockInfo.props.title,
          onChange: e => handleUpdateBlock('title', e.target.value),
        }}
        className="w-full text-center"
      />

      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsSamplePopupOpen(true)}
          >
            <Plus size={16} />
            샘플문구
          </UtilityButton>
        }
        direction="right"
      >
        내용
      </NavigationBar>

      <TextEditor
        key={`${id}-${editorResetKey}`}
        value={blockInfo.props.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />
      {Array.from({ length: blockInfo.props.groupList.length }).map((_, i) => (
        <Group
          key={i}
          groupIndex={i}
          groupName={blockInfo.props.groupList[i].name}
          accountList={blockInfo.props.accountList[i]}
          totalGroupList={blockInfo.props.groupList}
          totalAccountList={blockInfo.props.accountList}
          handleUpdateBlock={handleUpdateBlock}
        />
      ))}

      {isSamplePopupOpen && (
        <PopupOptions
          popupTitle="샘플 문구"
          options={ACCOUNT_SAMPLE_MESSAGES}
          onSelect={handleSampleSelect}
          onClose={() => setIsSamplePopupOpen(false)}
        />
      )}
    </div>
  );
};
