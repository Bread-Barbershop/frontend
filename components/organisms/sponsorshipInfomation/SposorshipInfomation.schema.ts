export const sponsorshipInfomationSchema = {
  type: null,
  fields: {
    title: {
      default: '후원사',
      required: true,
    },
    isEnglishTitle: {
      default: true,
      required: false,
    },
    englishTitle: {
      default: 'OUR SPONSORS',
      required: false,
    },
    images: {
      default: [] as (File | string)[],
      required: true,
    },
  },
} as const;
