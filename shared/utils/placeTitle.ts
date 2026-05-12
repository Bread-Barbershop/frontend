import type { InvitationType } from '@/shared/types/block';

export const LEGACY_PLACE_TITLE = '오시는 길';
export const GENERAL_PLACE_TITLE = '행사 장소';
export const WEDDING_PLACE_TITLE = '예식 장소';

export const getDefaultPlaceTitle = (type?: InvitationType) =>
  type === 'wedding' ? WEDDING_PLACE_TITLE : GENERAL_PLACE_TITLE;

export const isDefaultPlaceTitle = (
  title: string | undefined,
  type?: InvitationType
) => title === getDefaultPlaceTitle(type) || title === LEGACY_PLACE_TITLE;

export const normalizePlaceTitle = (
  title: string | undefined,
  type?: InvitationType
) => (isDefaultPlaceTitle(title, type) ? getDefaultPlaceTitle(type) : title);
