import React from 'react';

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
  monthOffset: number;
  setMonthOffset: React.Dispatch<React.SetStateAction<number>>;
  headerDays: string[];
  time?: string;
  language: 'ko' | 'en';
}
