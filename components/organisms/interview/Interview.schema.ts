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
          id: crypto.randomUUID(),
          messageJson: null,
          messageHtml: null,
        },
      ] as {
        id: string;
        messageJson: JSONContent | null;
        messageHtml: string | null;
      }[],
      required: false,
    },
    image: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
