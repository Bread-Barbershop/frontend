import type { JSONContent } from '@tiptap/react';

export const accountSchema = {
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
      required: true,
    },
    messageJson: {
      default: null as JSONContent | null,
      required: true,
    },
    messageHtml: {
      default: null as string | null,
      required: true,
    },
    groupList: {
      default: [{ name: '' }] as {
        name: string;
      }[],
      required: true,
    },
    accountList: {
      default: [[{ name: '', bank: '', account: '', kakao: false }]] as {
        name: string;
        bank: string;
        account: string;
        kakao: boolean;
      }[][],
      required: true,
    },
  },
} as const;
