export const videoSchema = {
  type: null,
  fields: {
    title: {
      default: '동영상',
      required: true,
    },
    checkedEnglishTitle: {
      default: true,
      required: true,
    },
    englishTitle: {
      default: 'VIDEO',
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
