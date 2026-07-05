import { createNoticeItem, type NoticeListItem } from './noticeList';

export const noticeSchema = {
  type: null,
  fields: {
    title: {
      default: '공지사항',
      required: true,
    },
    checkedSubTitle: {
      default: true,
      required: true,
    },
    subTitle: {
      default: 'INFORMATION',
      required: false,
    },
    noticeList: {
      default: () => [createNoticeItem()] as NoticeListItem[],
      required: false,
    },
  },
} as const;
