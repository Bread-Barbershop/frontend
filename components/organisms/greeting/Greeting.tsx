import { Plus } from 'lucide-react';
import { ChangeEvent, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { TextField } from '@/components/molecules/text-field';
import Popup from '@/components/organisms/popup/Popup';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, { messageJson: json });
  };

  const handleSampleSelect = (text: string) => {
    updateBlock(id, { messageJson: createParagraphJson(text) });
    // 같은 문구를 다시 선택해도 에디터가 해당 문구로 초기화되도록 강제 리마운트한다.
    setEditorResetKey(prev => prev + 1);
    setIsSamplePopupOpen(false);
  };

  return (
    <section aria-label="인사말">
      <div className="flex flex-col gap-1 w-93.75 rounded-lg px-5 pb-2.5">
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
      </div>

      {isSamplePopupOpen && (
        <Popup
          popupTitle="샘플 문구"
          options={GREETING_SAMPLE_MESSAGES}
          onSelect={handleSampleSelect}
          onClose={() => setIsSamplePopupOpen(false)}
        />
      )}
    </section>
  );
}

export default Greeting;
