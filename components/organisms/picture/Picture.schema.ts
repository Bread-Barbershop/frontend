import type { JSONContent } from '@tiptap/react';

export const pictureSchema = {
  type: null,
  fields: {
    imageRotation: { default: 0, required: false },
    imageScale: { default: 1, required: false },
    imageRatio: { default: '1/1', required: false },
    imageOffsetX: { default: 50, required: false },
    imageOffsetY: { default: 50, required: false },
    imageFilter: { default: 'none', required: false },
    imageBrightness: { default: 100, required: false },
    image: {
      default: [] as (File | string)[],
      required: true,
    },
    isTitle: {
      default: false,
      required: false,
    },
    title: {
      default: '사진',
      required: false,
    },
    isSubTitle: {
      default: false,
      required: false,
    },
    subTitle: {
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
