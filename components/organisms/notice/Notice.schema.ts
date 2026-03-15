import type { JSONContent } from '@tiptap/react';
export const noticeSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    messageJson: {
      default: null as JSONContent | null,
      required: false,
    },
    messageHtml: {
      default: null as string | null,
      required: false,
    },
    image: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
