import type { JSONContent } from '@tiptap/react';

export const greetingSchema = {
  type: null,
  fields: {
    title: {
      default: '인사말',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    subTitle: {
      default: 'INVITATION',
      required: false,
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
