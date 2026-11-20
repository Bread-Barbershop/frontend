export interface SponsorItem {
  id: string;
  name: string;
  logoIndex: number | null;
}

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
    sponsors: {
      default: [] as SponsorItem[],
      required: false,
    },
  },
} as const;
