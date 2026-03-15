import { Plus } from 'lucide-react';
import { ChangeEvent, useState, useMemo, useEffect } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { NoticeItem } from './NoticeItem';
import { NOTICE_LIST } from './noticeList';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'notice'>;
  id: string;
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

export const Notice = ({ blockInfo, id }: Props) => {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [isNoticeListOpen, setIsNoticeListOpen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handleNoticeListSelect = (text: string) => {
    debouncedUpdateMessage.cancel();
    const messageJson = createParagraphJson(text);
    updateBlock(id, {
      messageJson,
      messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
    });
    setEditorResetKey(prev => prev + 1);
    setIsNoticeListOpen(false);
    // add NoticeItem
  };

  return (
    <LeftEditorWrapper ariaLabel="공지사항">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsNoticeListOpen(true)}
          >
            <Plus size={16} />
            항목추가
          </UtilityButton>
        }
        direction="right"
      >
        공지사항
      </NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: blockInfo.props.title,
          onChange: handleTitleChange,
        }}
        className="text-center w-full"
      />
      <NoticeItem
        id={id}
        editorResetKey={editorResetKey}
        blockInfo={blockInfo}
        handleEditorChange={handleEditorChange}
      />

      {isNoticeListOpen && (
        <PopupOptions
          popupTitle="항목 추가"
          options={NOTICE_LIST}
          onSelect={handleNoticeListSelect}
          onClose={() => setIsNoticeListOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
};
