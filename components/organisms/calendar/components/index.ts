import { ComponentType } from 'react';

export * from './DDayCountdown';

import { CalendarTemplateProps } from '../types/calendar';

import { CalendarType1 } from './CalendarType1';
import { CalendarType2 } from './CalendarType2';
import { CalendarType3 } from './CalendarType3';
import { CalendarType4 } from './CalendarType4';
import { CalendarType5 } from './CalendarType5';

export const CalendarTemplates: Record<
  string,
  ComponentType<CalendarTemplateProps>
> = {
  calendarType1: CalendarType1,
  calendarType2: CalendarType2,
  calendarType3: CalendarType3,
  calendarType4: CalendarType4,
  calendarType5: CalendarType5,
};
