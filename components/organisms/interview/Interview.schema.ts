import type { JSONContent } from '@tiptap/react';

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
      default: [] as {
        id: string;
        question: string;
        answer: {
          messageJson: JSONContent | null;
          messageHtml: string | null;
        };
        image: (File | string)[];
      }[],
      required: false,
    },
  },
} as const;
