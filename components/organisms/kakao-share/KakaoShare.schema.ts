import { kakaoShareTemplate } from '@/shared/data/template/componentTemplate';

export const kakaoShareSchema = {
  type: kakaoShareTemplate,
  fields: {
    title: {
      default: '',
      required: true,
    },
    description: {
      default: '',
      required: true,
    },
    images: {
      default: [] as (File | string)[],
      required: true,
    },
    showLocationButton: {
      default: false,
      required: true,
    },
    showShareButton: {
      default: true,
      required: true,
    },
  },
} as const;
