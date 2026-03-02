import { galleryTemplate } from '@/shared/data/template/componentTemplate';

export const gallerySchema = {
  type: galleryTemplate,
  fields: {
    title: {
      default: '',
      required: true,
    },
    images: {
      default: [] as File[],
      required: true,
    },
    template: {
      default: 'galleryType1',
      required: true,
    },
    ratio: {
      default: '1:1',
      required: true,
    },
    isPopupViewer: {
      default: false,
      required: true,
    },
  },
} as const;
