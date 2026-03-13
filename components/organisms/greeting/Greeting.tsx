import { Plus } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import PopupOptions from '../popup/PopupOptions';

import { GREETING_SAMPLE_MESSAGES } from './greetingSampleMessages';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'greeting'>;
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

function Greeting({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [isSamplePopupOpen, setIsSamplePopupOpen] = useState(false);
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

  const handleSampleSelect = (text: string) => {
    debouncedUpdateMessage.cancel();
    const messageJson = createParagraphJson(text);
    updateBlock(id, {
      messageJson,
      messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
    });
    // 같은 문구를 다시 선택해도 에디터가 해당 문구로 초기화되도록 강제 리마운트한다.
    setEditorResetKey(prev => prev + 1);
    setIsSamplePopupOpen(false);
  };

  return (
    <LeftEditorWrapper ariaLabel="인사말">
      <NavigationBar>인사말</NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: blockInfo.props.title,
          onChange: handleTitleChange,
        }}
        className="text-center"
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

      {isSamplePopupOpen && (
        <PopupOptions
          popupTitle="샘플 문구"
          options={GREETING_SAMPLE_MESSAGES}
          onSelect={handleSampleSelect}
          onClose={() => setIsSamplePopupOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
}

export default Greeting;
