import { useMemo } from 'react';

import { InvitationType } from '@/shared/types/block';

import { ENG_DAYS, KOR_DAYS } from '../constants/calendar';
import {
  generateCalendarGrid,
  generateDateRange,
  getFormattedStringDate,
  getFormattedTimeLabel,
  getFormattedTimeStr,
  getMonthText,
  parseDateInfo,
  parseTargetDate,
  parseTimeInfo,
} from '../utils/utils';

export function useCalendarData({
  date,
  time,
  language,
  template,
  type,
}: {
  date?: string;
  time?: string;
  language: 'ko' | 'en';
  template?: string;
  type?: InvitationType;
}) {
  // 1) 원본 날짜 파싱
  const { year, month, day, dayOfWeek } = useMemo(
    () => parseDateInfo(date),
    [date]
  );

  // 2) 텍스트 포매팅 (기본 표시용)
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

  // 5) 템플릿용 확장 데이터
  const monthText = useMemo(
    () =>
      getMonthText(
        currentMonth,
        language,
        template === 'calendarType4' ? 'upper' : 'default'
      ),
    [currentMonth, language, template]
  );

  const targetLabel =
    type === 'wedding'
      ? language === 'ko'
        ? '결혼식'
        : 'Wedding day'
      : 'D-Day';

  const timeLabel = useMemo(
    () => getFormattedTimeLabel(time || '', language),
    [time, language]
  );

  return {
    currentYear,
    currentMonth,
    calendarDays,
    stringDateFormatted,
    formattedTime,
    headerDays,
    timeInfo: useMemo(() => parseTimeInfo(time), [time]),
    monthText,
    targetLabel,
    timeLabel,
  };
}
