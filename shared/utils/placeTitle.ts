import type { InvitationType } from '@/shared/types/block';

export const GENERAL_PLACE_TITLE = '행사 장소';
export const WEDDING_PLACE_TITLE = '예식 장소';

export const getDefaultPlaceTitle = (type?: InvitationType) =>
  type === 'wedding' ? WEDDING_PLACE_TITLE : GENERAL_PLACE_TITLE;

export const getPlaceFieldCopy = (type?: InvitationType) =>
  type === 'wedding'
    ? {
        placeNameLabel: '예식장명',
        placeNamePlaceholder: '예식장 이름 입력',
        placeDetailLabel: '층과 홀',
        placeDetailPlaceholder: '층과 홀 이름 입력',
        placeTelPlaceholder: '예식장 연락처, ex.02-000-000',
      }
    : {
        placeNameLabel: '장소명',
        placeNamePlaceholder: '장소 이름 입력',
        placeDetailLabel: '상세 위치',
        placeDetailPlaceholder: '층과 호실 등 상세 위치 입력',
        placeTelPlaceholder: '행사 장소 연락처, ex.02-000-000',
      };

export const isDefaultPlaceTitle = (
  title: string | undefined,
  type?: InvitationType
) => title === getDefaultPlaceTitle(type);

export const normalizePlaceTitle = (
  title: string | undefined,
  type?: InvitationType
) => (isDefaultPlaceTitle(title, type) ? getDefaultPlaceTitle(type) : title);
