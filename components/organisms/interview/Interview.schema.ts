import type { InterviewQuestion } from './interviewList';

export const interviewSchema = {
  type: null,
  fields: {
    title: {
      default: '인터뷰',
      required: true,
    },
    checkedEnglishTitle: {
      default: true,
      required: true,
    },
    englishTitle: {
      default: 'INTERVIEW',
      required: false,
    },
    questions: {
      default: [] as InterviewQuestion[],
      required: false,
    },
  },
} as const;
