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
  timeInfo: {
    timeText: string | undefined;
    ampm: string | undefined;
  };
  language: 'ko' | 'en';
  // 리팩토링으로 추가된 포맷팅 데이터
  monthText: string;
  targetLabel: string;
  timeLabel: string;
}
