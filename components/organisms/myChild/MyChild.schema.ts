import type { JSONContent } from '@tiptap/react';

export const myChildSchema = {
  type: null,
  fields: {
    title: {
      default: '아기 소개',
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
  },
} as const;
