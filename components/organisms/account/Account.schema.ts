import type { JSONContent } from '@tiptap/react';

export const accountSchema = {
  type: null,
  fields: {
    title: {
      default: '마음 보내실 곳',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    subTitle: {
      default: 'ACCOUNT',
      required: false,
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
