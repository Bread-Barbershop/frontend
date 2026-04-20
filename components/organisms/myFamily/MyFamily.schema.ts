import type { JSONContent } from '@tiptap/react';

export const myFamilySchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: false,
    },
    englishTitle: {
      default: '',
      required: false,
    },
    checkedEnglishTitle: {
      default: false,
      required: false,
    },
    checkedMessage: {
      default: false,
      required: false,
    },
    family: {
      default: [] as {
        id: string;
        relation: string;
        name: string;
        image: (File | string)[];
        flower: boolean;
      }[],
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
