import { calendarTemplate } from '@/shared/data/template/componentTemplate';

export const calendarSchema = {
  type: calendarTemplate,
  fields: {
    date: {
      default: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      })(),
      required: true,
    },
    time: {
      default: '오후 01:00',
      required: true,
    },
    showStringDate: {
      default: true,
      required: true,
    },
    template: {
      default: 'calendarType1',
      required: true,
    },
    showCalendar: {
      default: true,
      required: true,
    },
    showDday: {
      default: true,
      required: true,
    },
  },
} as const;
