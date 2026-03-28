import { shareUrlTemplate } from '@/shared/data/template/componentTemplate';

export const shareUrlSchema = {
  type: shareUrlTemplate,
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
    urlTitle: {
      default: '',
      required: true,
    },
    urlDescription: {
      default: '',
      required: true,
    },
    urlImage: {
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
    locationInfo: {
      default: {
        lat: 0,
        lng: 0,
      },
      required: false,
    },
  },
} as const;
