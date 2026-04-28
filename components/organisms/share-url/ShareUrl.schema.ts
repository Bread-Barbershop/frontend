import { shareUrlTemplate } from '@/shared/data/template/componentTemplate';

export const shareUrlSchema = {
  type: shareUrlTemplate,
  fields: {
    title: {
      default: '소중한 분들을 초대합니다.',
      required: true,
    },
    description: {
      default: '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.',
      required: true,
    },
    images: {
      default: [] as (File | string)[],
      required: true,
    },
    urlTitle: {
      default: '소중한 분들을 초대합니다.',
      required: true,
    },
    urlDescription: {
      default: '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.',
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
        placeName: '',
      },
      required: false,
    },
  },
} as const;
