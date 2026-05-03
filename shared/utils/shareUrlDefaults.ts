import { ShareUrlState } from '@/shared/types/block';

export const createDefaultShareUrlState = (): ShareUrlState => ({
  title: '',
  description: '',
  images: [],
  urlTitle: '',
  urlDescription: '',
  urlImage: [],
  showLocationButton: false,
  showShareButton: true,
  locationInfo: {
    lat: 0,
    lng: 0,
    placeName: '',
  },
});

export const DEFAULT_TITLE = '소중한 분들을 초대합니다.';
export const DEFAULT_DESCRIPTION =
  '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.';
