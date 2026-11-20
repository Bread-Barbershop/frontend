import { generateJSON, type JSONContent } from '@tiptap/core';
import { useMemo, type ChangeEvent } from 'react';

import { ActionField } from '@/components/molecules/action-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { createTextEditorBarExtensions } from '@/components/molecules/text-editor/utils/tiptapExtensions';
import { cn } from '@/shared/utils/cn';

import {
  getInterviewAnswerHtml,
  getInterviewTitle,
  isLegacyInterviewAnswer,
} from './interviewContent';

import type { InterviewQuestion } from './interviewList';

interface Props {
  id: string;
  question: InterviewQuestion;
  questionLength: number;
  editorResetKey: number;
  onQuestionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onPictureDelete: () => void;
  onDelete: () => void;
  loadingCount?: number;
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
  loadingCount = 0,
}: Props) => {
  const answer = useMemo(() => {
    const json = question.answer?.messageJson;
    if (json && !isLegacyInterviewAnswer(json)) return json;
    const html = getInterviewAnswerHtml(question.answer);
    return html && typeof window !== 'undefined'
      ? generateJSON(html, createTextEditorBarExtensions())
      : null;
  }, [question.answer]);
  return (
    <div className="flex flex-col gap-1 relative group">
      <ActionField
        label="인터뷰"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: getInterviewTitle(question.question),
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
          value={answer}
          defaultText="답변을 입력해 주세요"
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
          loadingCount={loadingCount}
        />
      </div>
    </div>
  );
};
