import { createTimelineItem, type TimelineItem } from './timelineItems';

export const timelineSchema = {
  type: null,
  fields: {
    title: { default: '행사 일정', required: true },
    items: {
      default: () => [createTimelineItem({ title: '행사 시작', time: '10:00' })] as TimelineItem[],
      required: true,
    },
  },
} as const;
