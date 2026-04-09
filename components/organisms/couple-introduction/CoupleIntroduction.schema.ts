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
      default: [] as File[],
      required: false,
    },
    brideImage: {
      default: [] as File[],
      required: false,
    },
    images: {
      default: [] as Array<File | string>,
      required: false,
    },
    title: {
      default: '',
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
