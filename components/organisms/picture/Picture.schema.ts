import type { JSONContent } from '@tiptap/react';

export const pictureSchema = {
  type: null,
  fields: {
    image: {
      default: [] as (File | string)[],
      required: true,
    },
    isTitle: {
      default: false,
      required: false,
    },
    title: {
      default: '제목을 입력해주세요.',
      required: false,
    },
    isEnglishTitle: {
      default: true,
      required: false,
    },
    enTitle: {
      default: 'PICTURE',
      required: false,
    },
    isContents: {
      default: false,
      required: false,
    },
    contentsJson: {
      default: null as JSONContent | null,
      required: false,
    },
    contentsHtml: {
      default: null as string | null,
      required: false,
    },
  },
} as const;
