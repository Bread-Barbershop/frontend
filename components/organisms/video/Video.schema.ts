export const videoSchema = {
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
    videoUrl: {
      default: '',
      required: true,
    },
    ratio: {
      default: '1:1',
      required: true,
    },
    image: {
      default: [] as (File | string)[],
      required: true,
    },
    checkThumbnail: {
      default: false,
      required: true,
    },
  },
} as const;
