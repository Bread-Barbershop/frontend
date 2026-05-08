import type { JSONContent } from '@tiptap/react';

export const interviewSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    checkedEnglishTitle: {
      default: false,
      required: true,
    },
    englishTitle: {
      default: '',
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
