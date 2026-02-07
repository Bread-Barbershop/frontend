import Gallery from './Gallery';
import GalleryPreview from './GalleryPreview';

export const galleryDefinition = {
  viewComponent: GalleryPreview,
  editComponent: Gallery,
  fields: {
    title: {
      default: '제목',
      required: true,
    },
    additionalTech: {
      default:
        '저희의 시작을 알리는 자리를 (행사일), (행사시간)에 마련했습니다.',
      required: true,
    },
    pictureList: {
      default: [] as File[],
      required: true,
    },
  },
};
