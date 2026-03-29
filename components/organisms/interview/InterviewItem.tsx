import { JSONContent } from '@tiptap/core';
import { ChangeEvent } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { TextField } from '@/components/molecules/text-field/TextField';

interface Props {
  id: string;
  index: number;
  questionsLength: number;
  question: {
    questionId: string;
    question: string;
    answer: {
      messageJson: JSONContent | null;
      messageHtml: string | null;
    };
  };
  editorResetKey: number;
  onQuestionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onDelete: () => void;
}

export const InterviewItem = ({
  id,
  index,
  questionsLength,
  question,
  editorResetKey,
  onQuestionChange,
  onEditorChange,
  onDelete,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 relative group">
      <NavigationBar
        className="min-h-auto h-8"
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
        인터뷰 {index + 1}번
      </NavigationBar>
      <TextField
        label="인터뷰"
        inputProps={{
          placeholder: '질문을 입력해 주세요',
          value: question.question,
          onChange: onQuestionChange,
        }}
        className="w-full text-center"
      />
      <NavigationBar className="min-h-auto h-8">내용</NavigationBar>
      <TextEditor
        key={`${id}-${question.questionId}-${editorResetKey}`}
        value={question.answer.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />
    </div>
  );
};
