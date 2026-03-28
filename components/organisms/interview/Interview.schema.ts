import type { JSONContent } from '@tiptap/react';

export const interviewSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    questions: {
      default: [] as {
        questionId: string;
        question: string;
        answer: {
          messageJson: JSONContent | null;
          messageHtml: string | null;
        };
      }[],
      required: false,
    },
    image: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
