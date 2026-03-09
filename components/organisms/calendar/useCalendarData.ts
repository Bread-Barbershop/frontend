import { useMemo, useState } from 'react';

import {
  ENG_DAYS,
  KOR_DAYS,
  generateCalendarGrid,
  getFormattedStringDate,
  getFormattedTimeStr,
  parseDateInfo,
} from './utils';

interface UseCalendarDataParams {
  date?: string;
  time?: string;
  language: 'ko' | 'en';
}

export function useCalendarData({
  date,
  time,
  language,
}: UseCalendarDataParams) {
  const [monthOffset, setMonthOffset] = useState(0);

  // 1) 원본 날짜 파싱 — date 변경 시에만 재계산
  const { year, month, day, dayOfWeek } = useMemo(
    () => parseDateInfo(date),
    [date]
  );

  // 2) 텍스트 포매팅 — date/time 변경 시에만 재계산 (스와이프와 무관)
  const stringDateFormatted = useMemo(
    () => getFormattedStringDate(year, month, day),
    [year, month, day]
  );

  const formattedTime = useMemo(
    () => getFormattedTimeStr(dayOfWeek, time),
    [dayOfWeek, time]
  );

  // 3) 달력 그리드 — monthOffset 변경 시에만 재계산
  const { currentYear, currentMonth, calendarDays } = useMemo(() => {
    const display = new Date(year, month + monthOffset, 1);
    const displayYear = display.getFullYear();
    const displayMonth = display.getMonth();

    return {
      currentYear: displayYear,
      currentMonth: displayMonth + 1,
      calendarDays: generateCalendarGrid(
        displayYear,
        displayMonth,
        day,
        monthOffset
      ),
    };
  }, [year, month, day, monthOffset]);

  // 4) 요일 헤더
  const headerDays = language === 'ko' ? KOR_DAYS : ENG_DAYS;

  return {
    currentYear,
    currentMonth,
    calendarDays,
    stringDateFormatted,
    formattedTime,
    headerDays,
    monthOffset,
    setMonthOffset,
  };
}
