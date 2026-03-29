export const videoSchema = {
  type: null,
  fields: {
    title: {
      default: '제목을 입력해 주세요.',
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
