import { JSONContent } from '@tiptap/core';
import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
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
  const { title, questions, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const handleUpdateBlock = (key: string, value: string | boolean) => {
    updateBlock(id, { [key]: value });
  };

  const handleQuestionChange = (
    question: string | null,
    questionId: string
  ) => {
    const newQuestions = (questions || []).map(q =>
      q.id === questionId
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
      id: crypto.randomUUID(),
      question: content,
      answer: {
        messageJson: null,
        messageHtml: null,
      },
      image: [] as (File | string)[],
    };

    updateBlock(id, {
      questions: [...(questions || []), newQuestion],
    });
    setEditorResetKey(prev => prev + 1);
    setIsQuestionListOpen(false);
  };

  const handleAnswerEditorChange = (questionId: string, json: JSONContent) => {
    const newQuestions = (questions || []).map(question =>
      question.id === questionId
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

  const handleQuestionImageChange = (
    questionId: string,
    file: (File | string)[]
  ) => {
    const newQuestions = (questions || []).map(question =>
      question.id === questionId
        ? {
            ...question,
            image: file,
          }
        : question
    );

    updateBlock(id, { questions: newQuestions });
    updateImage(questionId, file);
  };

  const handleQuestionImageDelete = (questionId: string) => {
    const newQuestions = (questions || []).map(question =>
      question.id === questionId
        ? {
            ...question,
            image: [],
          }
        : question
    );

    updateBlock(id, { questions: newQuestions });
    updateImage(questionId, []);
  };

  const handleQuestionDelete = (questionId: string) => {
    const newQuestions = (questions || []).filter(
      question => question.id !== questionId
    );

    updateBlock(id, { questions: newQuestions });
    updateImage(questionId, []);
  };

  useEffect(() => {
    if ((questions || []).length === 0) {
      const initQuestions = {
        id: crypto.randomUUID(),
        question: '',
        answer: {
          messageJson: null,
          messageHtml: null,
        },
        image: [] as (File | string)[],
      };
      updateBlock(id, { questions: [initQuestions] });
    }
  }, [id]);

  return (
    <LeftEditorWrapper ariaLabel="인터뷰" className="gap-3 pb-3">
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
        인터뷰 편집 페이지
      </NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '인터뷰',
          value: title === '인터뷰' ? '' : title,
          onChange: e => handleUpdateBlock('title', e.target.value || '인터뷰'),
        }}
        className="w-full text-center"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'INTERVIEW',
            value: englishTitle === 'INTERVIEW' ? '' : englishTitle,
            onChange: e =>
              handleUpdateBlock('englishTitle', e.target.value || 'INTERVIEW'),
          }}
          className="text-center w-full pt-1"
        />
      )}
      <section className="flex flex-row gap-2 items-center w-full">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          onChange={e =>
            handleUpdateBlock('checkedEnglishTitle', e.target.checked)
          }
          checked={checkedEnglishTitle}
        >
          영문 제목 추가
        </Checkbox>
      </section>

      <div className="flex flex-col gap-2 w-full">
        {(questions || []).map((question, index) => (
          <div key={question.id} className="flex flex-col gap-1">
            {index !== 0 && <Divider />}
            <InterviewItem
              id={id}
              question={question}
              questionLength={(questions || []).length}
              editorResetKey={editorResetKey}
              onQuestionChange={e =>
                handleQuestionChange(e.target.value, question.id)
              }
              onEditorChange={json =>
                handleAnswerEditorChange(question.id, json)
              }
              onPictureChange={file =>
                handleQuestionImageChange(question.id, file)
              }
              onPictureDelete={() => handleQuestionImageDelete(question.id)}
              onDelete={() => handleQuestionDelete(question.id)}
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
