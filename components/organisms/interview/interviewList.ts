import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import interviewDefaultImage from '@/shared/assets/images/interview/interview-default.png';

import {
  COUPLE_ANSWER_EXAMPLE,
  EMPTY_INTERVIEW_OPTION,
  INTERVIEW_QUESTION_OPTIONS,
} from './interviewOptions';

import type { JSONContent } from '@tiptap/react';
import type { StaticImageData } from 'next/image';

type InterviewPreset = {
  id: string;
  label: string;
  image?: StaticImageData;
};

export const QUESTION_PRESETS = [
  {
    id: 'first-impression',
    label: '서로의 첫인상은 어땠나요?',
  },
  {
    id: 'decision-moment',
    label: '이 사람과 결혼을 결심하게 된 순간은 언제였나요?',
  },
  {
    id: 'gratitude',
    label: '서로에게 가장 고마운 점은 무엇인가요?',
  },
  {
    id: 'promise',
    label: '함께 살면서 가장 중요하게 지키고 싶은 약속은 무엇인가요?',
  },
  {
    id: 'future',
    label: '앞으로 함께 만들고 싶은 모습은 무엇인가요?',
  },
] as const satisfies readonly InterviewPreset[];

export const INTERVIEW_DEFAULT_IMAGE = interviewDefaultImage;

export type InterviewPresetId = (typeof QUESTION_PRESETS)[number]['id'];

export type InterviewQuestion = {
  id: string;
  presetId?: InterviewPresetId;
  question: string;
  answer: {
    messageJson: JSONContent | null;
    messageHtml: string | null;
  };
  image: (File | string)[];
};

export const QUESTION_LIST = [...INTERVIEW_QUESTION_OPTIONS];

export const DEFAULT_QUESTION_PRESET = QUESTION_PRESETS[0];
export const DEFAULT_INTERVIEW_QUESTION = '제목을 입력해주세요';

export const getInterviewPresetByLabel = (label: string) =>
  QUESTION_PRESETS.find(preset => preset.label === label);

export const getInterviewPresetById = (presetId?: string | null) =>
  QUESTION_PRESETS.find(preset => preset.id === presetId);

export const getInterviewPresetForQuestion = (
  question: Pick<InterviewQuestion, 'question' | 'presetId'>
) =>
  getInterviewPresetById(question.presetId) ??
  getInterviewPresetByLabel(question.question);

export const getInterviewDefaultImage = (
  question: Pick<InterviewQuestion, 'question' | 'presetId'>
) => {
  const preset: InterviewPreset | undefined =
    getInterviewPresetForQuestion(question);

  return preset?.image ?? INTERVIEW_DEFAULT_IMAGE;
};

function createCoupleAnswerExample(): InterviewQuestion['answer'] {
  const messageJson: JSONContent = {
    type: 'doc',
    content: [
      '신랑',
      '처음 만났는데도 오랜 친구처럼 대화가 편했어요.',
      '신부',
      '제 이야기를 끝까지 들어주던 모습이 기억나요.',
    ].map(text => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
  };
  return { messageJson, messageHtml: tiptapJsonToHtmlUniversal(messageJson) };
}

export const createInterviewQuestion = (
  label = EMPTY_INTERVIEW_OPTION
): InterviewQuestion => {
  const withSampleAnswer = label === COUPLE_ANSWER_EXAMPLE;
  const preset = withSampleAnswer
    ? DEFAULT_QUESTION_PRESET
    : getInterviewPresetByLabel(label);

  return {
    id: crypto.randomUUID(),
    presetId: preset?.id,
    question: label === EMPTY_INTERVIEW_OPTION ? '' : (preset?.label ?? label),
    answer: withSampleAnswer
      ? createCoupleAnswerExample()
      : { messageJson: null, messageHtml: null },
    image: [],
  };
};
