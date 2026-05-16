import type { JSONContent } from '@tiptap/react';

export const noticeSchema = {
  type: null,
  fields: {
    title: {
      default: '공지사항',
      required: true,
    },
    checkedEnglishTitle: {
      default: true,
      required: true,
    },
    englishTitle: {
      default: 'INFORMATION',
      required: false,
    },
    noticeList: {
      default: [] as {
        id: string;
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
