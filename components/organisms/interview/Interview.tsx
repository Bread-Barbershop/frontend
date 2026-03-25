import { JSONContent } from '@tiptap/core';
import { useState, ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { PopupOptionsJSON } from '../popup/PopupOptionsJSON';
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

  const handleQuestionListSelect = (content: JSONContent, _index?: number) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      messageJson: content,
      messageHtml: tiptapJsonToHtmlInBrowser(content),
    };

    updateBlock(id, {
      questions: [...(questions || []), newQuestion],
    });
    setEditorResetKey(prev => prev + 1);
    setIsQuestionListOpen(false);
  };

  const handleQuestionEditorChange = (
    questionId: string,
    json: JSONContent
  ) => {
    const newQuestions = (questions || []).map(question =>
      question.id === questionId
        ? {
            ...question,
            messageJson: json,
            messageHtml: tiptapJsonToHtmlInBrowser(json),
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
      question => question.id !== questionId
    );
    updateBlock(id, { questions: newQuestions });
  };
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
          <div key={question.id} className="flex flex-col">
            {index !== 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
              </div>
            )}
            <InterviewItem
              id={id}
              questionsLength={questions?.length || 0}
              question={question}
              editorResetKey={editorResetKey}
              onEditorChange={json =>
                handleQuestionEditorChange(question.id, json)
              }
              onDelete={() => handleQuestionDelete(question.id)}
            />
          </div>
        ))}
      </div>

      {isQuestionListOpen && (
        <PopupOptionsJSON
          popupTitle="항목 추가"
          options={QUESTION_LIST}
          onSelect={handleQuestionListSelect}
          onClose={() => setIsQuestionListOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
};
