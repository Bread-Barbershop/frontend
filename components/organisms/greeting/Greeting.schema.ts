import type { JSONContent } from '@tiptap/react';

export const greetingSchema = {
  type: null,
  fields: {
    title: {
      default: '인사말',
      required: true,
    },
    messageJson: {
      default: null as JSONContent | null,
      required: false,
    },
  },
} as const;
