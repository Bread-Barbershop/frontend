import {
  createInterviewQuestion,
  type InterviewQuestion,
} from './interviewList';

export const interviewSchema = {
  type: null,
  fields: {
    title: {
      default: '인터뷰',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    subTitle: {
      default: 'INTERVIEW',
      required: false,
    },
    questions: {
      default: () => [createInterviewQuestion()] as InterviewQuestion[],
      required: false,
    },
  },
} as const;
