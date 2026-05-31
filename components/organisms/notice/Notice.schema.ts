import type { NoticeListItem } from './noticeList';

export const noticeSchema = {
  type: null,
  fields: {
    title: {
      default: '공지사항',
      required: true,
    },
    checkedEnglishTitle: {
      default: true,
      required: true,
    },
    englishTitle: {
      default: 'INFORMATION',
      required: false,
    },
    noticeList: {
      default: [] as NoticeListItem[],
      required: false,
    },
  },
} as const;
