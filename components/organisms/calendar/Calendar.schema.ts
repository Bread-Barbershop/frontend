import { calendarTemplate } from '@/shared/data/template/componentTemplate';

export const calendarSchema = {
  type: calendarTemplate,
  fields: {
    date: {
      default: '',
      required: true,
    },
    time: {
      default: '',
      required: false,
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
