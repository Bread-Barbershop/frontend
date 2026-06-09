import { ShareUrlState } from '@/shared/types/block';

/** 공유 썸네일 기본값 SSOT */
export const DEFAULT_TITLE = '소중한 분들을 초대합니다.';
export const DEFAULT_DESCRIPTION =
  '뜻깊은 날, 귀한 걸음으로 저희와 함께해 주세요.';
export const DEFAULT_IMAGE_URL = '/images/wedding_default.webp';

const DRIVE_IMAGE_BASE_URL = 'https://lh3.googleusercontent.com/d/';

const normalizeSharePublicOrigin = (origin?: string) =>
  origin?.trim().replace(/\/$/, '') ?? '';

export function resolveShareTitle(title?: string | null): string {
  return title?.trim() || DEFAULT_TITLE;
}

export function resolveShareDescription(description?: string | null): string {
  return description?.trim() || DEFAULT_DESCRIPTION;
}

export function resolveShareImageUrl(
  imageFileId?: string | null,
  origin?: string
): string {
  const normalizedFileId = imageFileId?.trim();

  if (normalizedFileId) {
    return `${DRIVE_IMAGE_BASE_URL}${normalizedFileId}`;
  }

  const publicOrigin =
    normalizeSharePublicOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeSharePublicOrigin(origin);

  return publicOrigin
    ? `${publicOrigin}${DEFAULT_IMAGE_URL}`
    : DEFAULT_IMAGE_URL;
}

export const createDefaultShareUrlState = (): ShareUrlState => ({
  title: '',
  description: '',
  images: [],
  urlTitle: '',
  urlDescription: '',
  urlImage: [],
  showLocationButton: false,
  locationInfo: {
    lat: 0,
    lng: 0,
    placeName: '',
  },
});
