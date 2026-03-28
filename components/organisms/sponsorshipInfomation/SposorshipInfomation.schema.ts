export const sponsorshipInfomationSchema = {
  type: null,
  fields: {
    title: {
      default: '제목을 입력해 주세요.',
      required: true,
    },
    images: {
      default: [] as (File | string)[],
      required: true,
    },
  },
} as const;
