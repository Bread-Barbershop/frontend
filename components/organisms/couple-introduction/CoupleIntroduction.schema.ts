import type { JSONContent } from '@tiptap/react';

export const coupleIntroductionSchema = {
  type: null,
  fields: {
    groom: {
      default: '',
      required: true,
    },
    bride: {
      default: '',
      required: true,
    },
    groomImage: {
      default: {
        id: '',
        image: [] as Array<File | string>,
      },
      required: false,
    },
    brideImage: {
      default: {
        id: '',
        image: [] as Array<File | string>,
      },
      required: false,
    },
    title: {
      default: '신랑・신부 소개',
      required: false,
    },
    checkedEnglishTitle: {
      default: true,
      required: false,
    },
    englishTitle: {
      default: 'INTRODUCTION',
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
    showProfileImage: {
      default: true,
      required: false,
    },
    showTitle: {
      default: false,
      required: false,
    },
    showContent: {
      default: false,
      required: false,
    },
    brideFirst: {
      default: false,
      required: false,
    },
  },
} as const;
