

export interface CalendarDayInfo {
  num: number;
  isCurrentMonth: boolean;
  isTargetDate: boolean;
  originalDate: Date;
}

export interface CalendarTemplateProps {
  currentYear: number;
  currentMonth: number;
  calendarDays: CalendarDayInfo[];
  headerDays: string[];
  time?: string;
  language: 'ko' | 'en';
}
