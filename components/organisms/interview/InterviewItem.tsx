import { JSONContent } from '@tiptap/core';
import { ChangeEvent } from 'react';

import { ActionField } from '@/components/molecules/action-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { cn } from '@/shared/utils/cn';

interface Props {
  id: string;
  question: {
    id: string;
    question: string;
    answer: {
      messageJson: JSONContent | null;
      messageHtml: string | null;
    };
    image: (File | string)[];
  };
  questionLength: number;
  editorResetKey: number;
  onQuestionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onPictureDelete: () => void;
  onDelete: () => void;
}

export const InterviewItem = ({
  id,
  question,
  questionLength,
  editorResetKey,
  onQuestionChange,
  onEditorChange,
  onPictureChange,
  onPictureDelete,
  onDelete,
}: Props) => {
  return (
    <div className="flex flex-col gap-1 relative group">
      <ActionField
        label="인터뷰"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: question.question,
          onChange: onQuestionChange,
        }}
        className="w-full py-1.5 text-center"
        buttonProps={{
          onClick: onDelete,
          children: <p className="text-red-500">삭제</p>,
          className: cn(
            questionLength > 1 ? 'block border-none w-[32px]' : 'hidden'
          ),
        }}
      />
      <div className="flex flex-col gap-1">
        <NavigationBar className="min-h-auto h-8">내용</NavigationBar>
        <TextEditor
          key={`${id}-${question.id}-${editorResetKey}`}
          value={question.answer.messageJson}
          defaultText="내용을 입력해 주세요"
          defaultAlign="center"
          onChange={onEditorChange}
        />
        <Picture
          label="배너사진"
          className="w-full py-1.5 text-center"
          multiple={false}
          value={question.image}
          onChange={onPictureChange}
          onDelete={onPictureDelete}
        />
      </div>
    </div>
  );
};
