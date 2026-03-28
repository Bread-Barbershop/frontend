import type { JSONContent } from '@tiptap/react';

export const noticeSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    items: {
      default: [
        {
          id: crypto.randomUUID(),
          messageJson: null,
          messageHtml: null,
          image: [],
        },
      ] as {
        id: string;
        messageJson: JSONContent | null;
        messageHtml: string | null;
        image: (File | string)[];
      }[],
      required: false,
    },
    images: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
