import type { JSONContent } from '@tiptap/react';

export const speakerInformationSchema = {
  type: null,
  fields: {
    title: {
      default: '',
      required: true,
    },
    englishTitle: {
      default: '',
      required: false,
    },
    checkedEnglishTitle: {
      default: false,
      required: true,
    },
    speakers: {
      default: [] as {
        id: string;
        name: string;
        messageJson: JSONContent | null;
        messageHtml: string | null;
        image: (File | string)[];
      }[],
      required: false,
    },
    images: {
      default: [] as (File | string)[],
      required: false,
    },
  },
} as const;
