export const sponsorshipInfomationSchema = {
  type: null,
  fields: {
    title: {
      default: '후원사',
      required: true,
    },
    isSubTitle: {
      default: true,
      required: false,
    },
    subTitle: {
      default: 'OUR SPONSORS',
      required: false,
    },
    images: {
      default: [] as (File | string)[],
      required: true,
    },
  },
} as const;
