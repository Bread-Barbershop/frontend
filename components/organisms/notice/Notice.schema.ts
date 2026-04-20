import type { JSONContent } from '@tiptap/react';

export const noticeSchema = {
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
    noticeList: {
      default: [
        {
          id: crypto.randomUUID(),
          notice: '',
          messageJson: null,
          messageHtml: null,
          image: [],
        },
      ] as {
        id: string;
        notice: string;
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
