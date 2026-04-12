import type { JSONContent } from '@tiptap/react';

export const interviewSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    questions: {
      default: [
        {
          questionId: crypto.randomUUID(),
          question: '',
          answer: {
            messageJson: null,
            messageHtml: null,
          },
          image: [] as (File | string)[],
        },
      ] as {
        questionId: string;
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
