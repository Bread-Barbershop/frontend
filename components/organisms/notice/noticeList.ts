import noticeClothesImage from '@/shared/assets/images/notice/notice-clothes.png';
import noticeParkingImage from '@/shared/assets/images/notice/notice-parking.png';
import noticePartyImage from '@/shared/assets/images/notice/notice-party.png';
import noticeShootingImage from '@/shared/assets/images/notice/notice-shooting.png';
import noticeTimeImage from '@/shared/assets/images/notice/notice-time.png';

import { EMPTY_NOTICE_OPTION, NOTICE_TITLE_OPTIONS } from './noticeOptions';

import type { JSONContent } from '@tiptap/react';
import type { StaticImageData } from 'next/image';

export const NOTICE_PRESETS = [
  {
    id: 'party',
    label: '연회 & 식사 안내',
    image: noticePartyImage,
  },
  {
    id: 'parking',
    label: '주차 안내',
    image: noticeParkingImage,
  },
  {
    id: 'time',
    label: '행사 시간 안내',
    image: noticeTimeImage,
  },
  {
    id: 'clothes',
    label: '복장 안내 (드레스 코드)',
    image: noticeClothesImage,
  },
  {
    id: 'shooting',
    label: '사진 및 촬영 안내',
    image: noticeShootingImage,
  },
] as const satisfies readonly {
  id: string;
  label: string;
  image: StaticImageData;
}[];

export type NoticePresetId = (typeof NOTICE_PRESETS)[number]['id'];

export type NoticeListItem = {
  id: string;
  presetId?: NoticePresetId;
  notice: string;
  content: {
    messageJson: JSONContent | null;
    messageHtml: string | null;
  };
  image: (File | string)[];
};

export const NOTICE_LIST = [...NOTICE_TITLE_OPTIONS];

export const DEFAULT_NOTICE_PRESET = NOTICE_PRESETS[0];
export const DEFAULT_NOTICE_TITLE = '제목을 입력해주세요';

export const getNoticePresetByLabel = (label: string) =>
  NOTICE_PRESETS.find(preset => preset.label === label);

export const getNoticePresetById = (presetId?: string | null) =>
  NOTICE_PRESETS.find(preset => preset.id === presetId);

export const getNoticePresetForItem = (
  item: Pick<NoticeListItem, 'notice' | 'presetId'>
) => getNoticePresetById(item.presetId) ?? getNoticePresetByLabel(item.notice);

export const getNoticeDefaultImage = (
  item: Pick<NoticeListItem, 'notice' | 'presetId'>
) => getNoticePresetForItem(item)?.image ?? DEFAULT_NOTICE_PRESET.image;

export const createNoticeItem = (
  label = EMPTY_NOTICE_OPTION
): NoticeListItem => {
  const isEmptyOption = label === EMPTY_NOTICE_OPTION;
  const preset = isEmptyOption ? undefined : getNoticePresetByLabel(label);

  return {
    id: crypto.randomUUID(),
    presetId: preset?.id,
    notice: isEmptyOption ? '' : (preset?.label ?? label),
    content: {
      messageJson: null,
      messageHtml: null,
    },
    image: [],
  };
};
