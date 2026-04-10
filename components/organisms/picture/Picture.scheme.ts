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
      default: '',
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
    isEffect: {
      default: false,
      required: false,
    },
    selectedEffect: {
      default: 'none',
      required: false,
    },
  },
} as const;
