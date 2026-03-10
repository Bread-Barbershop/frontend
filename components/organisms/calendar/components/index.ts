import { ComponentType } from 'react';

export * from './DDayCountdown';

import { CalendarType1 } from './CalendarType1';
import { CalendarType2 } from './CalendarType2';
import { CalendarType3 } from './CalendarType3';
import { CalendarTemplateProps } from './types';

export const CalendarTemplates: Record<
  string,
  ComponentType<CalendarTemplateProps>
> = {
  calendarType1: CalendarType1,
  calendarType2: CalendarType2,
  calendarType3: CalendarType3,
};
