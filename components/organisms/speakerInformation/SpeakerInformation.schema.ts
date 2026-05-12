import type { JSONContent } from '@tiptap/react';

export const speakerInformationSchema = {
  type: null,
  fields: {
    title: {
      default: '연사정보',
      required: true,
    },
    englishTitle: {
      default: 'SPEAKER INFORMATION',
      required: false,
    },
    checkedEnglishTitle: {
      default: true,
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
  },
} as const;
