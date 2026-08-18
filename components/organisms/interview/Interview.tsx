import { JSONContent } from '@tiptap/core';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { InterviewItem } from './InterviewItem';
import { createInterviewQuestion, QUESTION_LIST } from './interviewList';

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
  const { warning } = useToast();
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const questionListTriggerRef = useRef<HTMLDivElement>(null);
  const questionItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingScrollQuestionIdRef = useRef<string | null>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [pendingUpload, setPendingUpload] = useState<{
    id: string;
    count: number;
  } | null>(null);
  const { title, questions, checkedSubTitle, subTitle } =
    blockInfo.props;

  const handleUpdateBlock = (key: string, value: string | boolean) => {
    updateBlock(id, { [key]: value });
  };

  const handleQuestionChange = (question: string, questionId: string) => {
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
    const nextQuestion = createInterviewQuestion(content, {
      includeEmptyTemplate: true,
    });

    updateBlock(id, {
      questions: [...(questions || []), nextQuestion],
    });
    pendingScrollQuestionIdRef.current = nextQuestion.id;
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

  const handleQuestionImageChange = async (
    questionId: string,
    file: (File | string)[]
  ) => {
    const files = file.filter((f): f is File => f instanceof File);
    setPendingUpload({ id: questionId, count: files.length });
    try {
      const compressedFiles = await compressImages(files);
      const compressed = file.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );

      const newQuestions = (questions || []).map(question =>
        question.id === questionId
          ? {
              ...question,
              image: compressed,
            }
          : question
      );

      updateBlock(id, { questions: newQuestions });
      updateImage(questionId, compressed);
    } catch (error) {
      console.error('[Interview] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setPendingUpload(null);
    }
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
      updateBlock(id, { questions: [createInterviewQuestion()] });
    }
  }, [id]);

  useEffect(() => {
    const pendingQuestionId = pendingScrollQuestionIdRef.current;
    if (!pendingQuestionId) return;

    const target = questionItemRefs.current[pendingQuestionId];
    if (!target) return;

    const scrollContainer = target.closest('section');
    window.requestAnimationFrame(() => {
      scrollContainer?.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    });
    pendingScrollQuestionIdRef.current = null;
  }, [questions]);

  return (
    <LeftEditorWrapper ariaLabel="인터뷰" className="pb-3">
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
        className="w-full py-1.5 text-center"
      />
      {checkedSubTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'INTERVIEW',
            value: subTitle === 'INTERVIEW' ? '' : subTitle,
            onChange: e =>
              handleUpdateBlock(
                'subTitle',
                sanitizeEnglishTitleInput(e.target) || 'INTERVIEW'
              ),
          }}
          className="w-full py-1.5 text-center"
        />
      )}
      <section className="flex flex-row gap-2 items-center w-full py-1.5">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          onChange={e =>
            handleUpdateBlock('checkedSubTitle', e.target.checked)
          }
          checked={checkedSubTitle}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </section>

      <div className="flex flex-col gap-1 w-full">
        {(questions || []).map((question, index) => (
          <div
            key={question.id}
            ref={element => {
              questionItemRefs.current[question.id] = element;
            }}
            className="flex flex-col gap-1"
          >
            {index !== 0 && <Divider className="w-full" />}
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
              loadingCount={
                pendingUpload?.id === question.id ? pendingUpload.count : 0
              }
            />
          </div>
        ))}
      </div>
      <EditorNoticeList
        notices={[
          {
            id: 'interview-default-image',
            text: '배너사진을 추가하지 않으실 경우, 기본 이미지로 제공됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
          {
            id: 'interview-animation',
            text: '항목이 2개 이상일 경우, 애니메이션 효과가 적용됩니다.',
          },
        ]}
      />

      {isQuestionListOpen && (
        <PopupOptions
          popupTitle="항목 추가"
          options={QUESTION_LIST}
          onSelect={handleQuestionListSelect}
          onClose={() => setIsQuestionListOpen(false)}
          triggerRef={questionListTriggerRef}
        />
      )}
    </LeftEditorWrapper>
  );
};
