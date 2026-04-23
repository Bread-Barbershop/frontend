import type { JSONContent } from '@tiptap/react';

export const myChildSchema = {
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
    name: {
      default: '',
      required: true,
    },
    nickname: {
      default: '',
      required: false,
    },
    birthday: {
      default: '',
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
    image: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
