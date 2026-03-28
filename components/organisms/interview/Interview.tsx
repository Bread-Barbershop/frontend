import { JSONContent } from '@tiptap/core';
import { useState, ChangeEvent, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { InterviewItem } from './InterviewItem';
import { QUESTION_LIST } from './interviewList';

interface Props {
  blockInfo: EditorBlock<'interview'>;
  id: string;
}
export const Interview = ({ blockInfo, id }: Props) => {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const { title, questions, image } = blockInfo.props;

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleQuestionChange = (
    question: string | null,
    questionId: string
  ) => {
    const newQuestions = (questions || []).map(q =>
      q.questionId === questionId
        ? {
            ...q,
            question,
          }
        : q
    );
    updateBlock(id, { questions: newQuestions });
  };

  const handleQuestionListSelect = (content: string, _index?: number) => {
    const newQuestion = {
      questionId: crypto.randomUUID(),
      question: content,
      answer: {
        messageJson: null,
        messageHtml: null,
      },
    };

    updateBlock(id, {
      questions: [...(questions || []), newQuestion],
    });
    setEditorResetKey(prev => prev + 1);
    setIsQuestionListOpen(false);
  };

  const handleAnswerEditorChange = (questionId: string, json: JSONContent) => {
    const newQuestions = (questions || []).map(question =>
      question.questionId === questionId
        ? {
            ...question,
            answer: {
              messageJson: json,
              messageHtml: tiptapJsonToHtmlInBrowser(json),
            },
          }
        : question
    );
    updateBlock(id, { questions: newQuestions });
  };

  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { image: file });
    updateImage(id, file);
  };

  const handleQuestionDelete = (questionId: string) => {
    const newQuestions = (questions || []).filter(
      question => question.questionId !== questionId
    );
    updateBlock(id, { questions: newQuestions });
  };

  useEffect(() => {
    if ((questions || []).length === 0) {
      const initQuestions = {
        questionId: crypto.randomUUID(),
        question: '',
        answer: {
          messageJson: null,
          messageHtml: null,
        },
      };
      updateBlock(id, { questions: [initQuestions] });
    }
  }, [id]);

  return (
    <LeftEditorWrapper ariaLabel="인터뷰" className="gap-3">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsQuestionListOpen(true)}
          >
            항목추가
          </UtilityButton>
        }
        direction="right"
      >
        인터뷰
      </NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: title,
          onChange: handleTitleChange,
        }}
        className="w-full text-center"
      />
      <Picture
        label="사진"
        className="w-full text-center"
        multiple={false}
        value={image}
        onChange={handlePictureChange}
      />

      <div className="flex flex-col gap-6 w-full">
        {(questions || []).map((question, index) => (
          <div key={question.questionId} className="flex flex-col">
            {index !== 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
              </div>
            )}
            <InterviewItem
              id={id}
              index={index}
              questionsLength={questions?.length || 0}
              question={question}
              editorResetKey={editorResetKey}
              onQuestionChange={e =>
                handleQuestionChange(e.target.value, question.questionId)
              }
              onEditorChange={json =>
                handleAnswerEditorChange(question.questionId, json)
              }
              onDelete={() => handleQuestionDelete(question.questionId)}
            />
          </div>
        ))}
      </div>

      {isQuestionListOpen && (
        <PopupOptions
          popupTitle="항목 추가"
          options={QUESTION_LIST}
          onSelect={handleQuestionListSelect}
          onClose={() => setIsQuestionListOpen(false)}
          listClassName="justify-center items-center"
          textClassName="bg-bg-sub rounded-xl flex items-center px-4 h-13"
        />
      )}
    </LeftEditorWrapper>
  );
};
