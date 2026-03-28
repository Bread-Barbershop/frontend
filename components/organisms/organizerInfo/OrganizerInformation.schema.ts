import type { JSONContent } from '@tiptap/react';

export const organizerInformationSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    organizer: {
      default: '',
      required: true,
    },
    hasUrl: {
      default: false,
      required: false,
    },
    url: {
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
    image: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
