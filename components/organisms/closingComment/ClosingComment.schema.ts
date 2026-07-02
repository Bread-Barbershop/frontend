import { JSONContent } from '@tiptap/core';

export const closingCommentSchema = {
  type: null,
  fields: {
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
