import { useMemo } from 'react';

import {
  ENG_DAYS,
  KOR_DAYS,
  generateCalendarGrid,
  generateDateRange,
  getFormattedStringDate,
  getFormattedTimeStr,
  parseDateInfo,
  parseTargetDate,
  parseTimeInfo,
} from './utils';

export function useCalendarData({
  date,
  time,
  language,
  template,
}: {
  date?: string;
  time?: string;
  language: 'ko' | 'en';
  template?: string;
}) {
  // 1) 원본 날짜 파싱
  const { year, month, day, dayOfWeek } = useMemo(
    () => parseDateInfo(date),
    [date]
  );

  // 2) 텍스트 포매팅
  const stringDateFormatted = useMemo(
    () => getFormattedStringDate(year, month, day),
    [year, month, day]
  );

  const formattedTime = useMemo(
    () => getFormattedTimeStr(dayOfWeek, time),
    [dayOfWeek, time]
  );

  // 3) 달력 데이터 생성
  const { currentYear, currentMonth, calendarDays } = useMemo(() => {
    const targetDate = parseTargetDate(date);
    const dys = targetDate.getFullYear();
    const dms = targetDate.getMonth();

    const getCalendarDays = () => {
      switch (template) {
        case 'calendarType2': // 1주일 뷰 (Sun-Sat)
          return generateDateRange(targetDate, -targetDate.getDay(), 7, dms);
        case 'calendarType4': // +-7일 뷰 (총 14일)
          return generateDateRange(targetDate, -7, 14, dms);
        case 'calendarType5': // -5일 뷰 (총 5일)
          return generateDateRange(targetDate, -4, 5, dms);
        default: // 기본 월간 뷰 (Type 1, Type 3)
          return generateCalendarGrid(dys, dms, day, 0);
      }
    };

    return {
      currentYear: dys,
      currentMonth: dms + 1,
      calendarDays: getCalendarDays(),
    };
  }, [day, template, date]);

  // 4) 요일 헤더
  const headerDays = language === 'ko' ? KOR_DAYS : ENG_DAYS;

  return {
    currentYear,
    currentMonth,
    calendarDays,
    stringDateFormatted,
    formattedTime,
    headerDays,
    timeInfo: useMemo(() => parseTimeInfo(time), [time]),
  };
}
