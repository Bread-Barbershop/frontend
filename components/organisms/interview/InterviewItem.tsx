import { JSONContent } from '@tiptap/core';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';

interface Props {
  id: string;
  questionsLength: number;
  question: {
    id: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
  };
  editorResetKey: number;
  onEditorChange: (json: JSONContent) => void;
  onDelete: () => void;
}

export const InterviewItem = ({
  id,
  questionsLength,
  question,
  editorResetKey,
  onEditorChange,
  onDelete,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 relative group">
      <NavigationBar
        action={
          questionsLength > 1 && (
            <UtilityButton
              size="sm"
              variant="danger"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              삭제
            </UtilityButton>
          )
        }
      >
        내용
      </NavigationBar>
      <TextEditor
        key={`${id}-${question.id}-${editorResetKey}`}
        value={question.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />
    </div>
  );
};
