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
          noticeId: crypto.randomUUID(),
          notice: '',
          content: {
            messageJson: null,
            messageHtml: null,
          },
          image: [] as (File | string)[],
        },
      ] as {
        noticeId: string;
        notice: string;
        content: {
          messageJson: JSONContent | null;
          messageHtml: string | null;
        };
        image: (File | string)[];
      }[],
      required: false,
    },
  },
} as const;
