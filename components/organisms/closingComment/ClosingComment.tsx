import { JSONContent } from '@tiptap/core';
import { useRef, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor, TextEditorRef } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import ClosingQuestionPopup from './ClosingQuestionPopup';

interface Props {
  blockInfo: EditorBlock<'closingComment'>;
  id: string;
}

function ClosingComment({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { messageJson } = blockInfo.props;
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const questionListTriggerRef = useRef<HTMLDivElement>(null);
  const textEditorRef = useRef<TextEditorRef>(null);
  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
  };

  const handleQuestionListSelect = (text: string) => {
    textEditorRef.current?.setText(text);
    setIsQuestionListOpen(false);
  };

  return (
    <LeftEditorWrapper ariaLabel="인사말" className="gap-1">
      <NavigationBar
        action={
          <div ref={questionListTriggerRef}>
            <UtilityButton
              size="md"
              variant="primary"
              onClick={() => setIsQuestionListOpen(true)}
            >
              예시보기
            </UtilityButton>
          </div>
        }
      >
        마무리 문구 페이지
      </NavigationBar>

      <NavigationBar>내용</NavigationBar>

      <div className="w-full flex flex-col gap-2">
        <TextEditor
          key={id}
          ref={textEditorRef}
          value={messageJson}
          defaultText="내용을 입력해 주세요"
          defaultAlign="center"
          onChange={handleEditorChange}
        />
      </div>
      <EditorNoticeList
        notices={[
          {
            id: 'closing-comment',
            text: '최대 40자 정도의 문구가 적합합니다.',
          },
        ]}
        className="mb-2"
      />
      {isQuestionListOpen && (
        <ClosingQuestionPopup
          onSelect={handleQuestionListSelect}
          onClose={() => setIsQuestionListOpen(false)}
          triggerRef={questionListTriggerRef}
        />
      )}
    </LeftEditorWrapper>
  );
}
export default ClosingComment;
