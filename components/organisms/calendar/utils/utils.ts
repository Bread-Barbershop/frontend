import {
  ENG_DAYS,
  KOR_DAYS,
  MONTH_NAMES_EN,
  MONTH_NAMES_EN_SHORT,
  MONTH_NAMES_EN_UPPER,
} from '../constants/calendar';
import { CalendarDayInfo } from '../types/calendar';

/**
 * 2026-03-09 -> { year: 2026, month: 3, day: 9 }
 */
export const parseDateInfo = (dateStr?: string) => {
  if (!dateStr) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dayOfWeek: now.getDay(),
    };
  }
  const [year, month, day] = dateStr.split('-').map(v => parseInt(v, 10));
  const dateObj = new Date(year, month - 1, day);

  return {
    year,
    month,
    day,
    dayOfWeek: dateObj.getDay(),
  };
};

/**
 * date string -> Date 객체
 */
export const parseTargetDate = (dateStr?: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * "오후 12:00" -> { timeText: "12:00", ampm: "오후" }
 */
export const parseTimeInfo = (timeStr?: string) => {
  if (!timeStr) return { timeText: undefined, ampm: undefined };
  const [ampm, timeText] = timeStr.split(' ');
  return { ampm, timeText };
};

/**
 * 하이픈 추가 (20250309 -> 2025-03-09)
 */
export const addHyphenToDate = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

/**
 * 특정 달의 6주 그리드 데이터 생성
 */
export const generateCalendarGrid = (
  year: number,
  month: number, // 0-indexed
  targetDay: number,
  startDayOfWeek = 0 // 0: Sun, 1: Mon...
): CalendarDayInfo[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const prevLastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const prevDaysInMonth = prevLastDay.getDate();

  const startDay = firstDay.getDay(); // 0(Sun) ~ 6(Sat)
  const offset = (startDay - startDayOfWeek + 7) % 7;

  const res: CalendarDayInfo[] = [];

  // 이전 달
  for (let i = offset - 1; i >= 0; i--) {
    const d = prevDaysInMonth - i;
    res.push({
      num: d,
      isCurrentMonth: false,
      isTargetDate: false,
      originalDate: new Date(year, month - 1, d),
    });
  }

  // 이번 달
  for (let i = 1; i <= daysInMonth; i++) {
    res.push({
      num: i,
      isCurrentMonth: true,
      isTargetDate: i === targetDay,
      originalDate: new Date(year, month, i),
    });
  }

  // 다음 달 (6주 - 42칸 기준 나머지)
  const remain = 42 - res.length;
  for (let i = 1; i <= remain; i++) {
    res.push({
      num: i,
      isCurrentMonth: false,
      isTargetDate: false,
      originalDate: new Date(year, month + 1, i),
    });
  }

  return res;
};

/**
 * 타겟 날짜 기준 offset부터 count만큼의 날짜 생성
 */
export const generateDateRange = (
  targetDate: Date,
  offset: number,
  count: number,
  currentMonth: number
): CalendarDayInfo[] => {
  const res: CalendarDayInfo[] = [];
  const baseDate = new Date(targetDate);
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(targetDate);
    d.setDate(targetDate.getDate() + offset + i);
    res.push({
      num: d.getDate(),
      isCurrentMonth: d.getMonth() === currentMonth,
      isTargetDate: d.getTime() === baseDate.getTime(),
      originalDate: d,
    });
  }
  return res;
};

/**
 * KO: "2026년 3월 9일 월요일"
 */
export const getFormattedStringDate = (
  year: number,
  month: number,
  day: number
) => {
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return `${year}년 ${month}월 ${day}일 ${KOR_DAYS[dayOfWeek]}요일`;
};

/**
 * 시간 문자열 포맷팅
 */
export const getFormattedTimeStr = (dayOfWeek: number, time?: string) => {
  if (!time) return '';
  return `${time}`;
};

/**
 * 월 텍스트 가져오기 (EN/KO)
 */
export const getMonthText = (
  month: number,
  language: 'ko' | 'en',
  format: 'default' | 'short' | 'upper' = 'default'
) => {
  if (language === 'ko') return `${month}월`;

  switch (format) {
    case 'short':
      return MONTH_NAMES_EN_SHORT[month - 1];
    case 'upper':
      return MONTH_NAMES_EN_UPPER[month - 1];
    default:
      return MONTH_NAMES_EN[month - 1];
  }
};

/**
 * 요일 텍스트 가져오기 (EN/KO)
 */
export const getWeekdayStr = (date: Date, language: 'ko' | 'en') => {
  const dayIndex = date.getDay();
  return language === 'ko' ? KOR_DAYS[dayIndex] : ENG_DAYS[dayIndex];
};

/**
 * 시간 포맷팅 (Type 5용) - "12:00" -> "12시" or "12 PM"
 */
export const getFormattedTimeLabel = (
  timeStr: string,
  language: 'ko' | 'en'
) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const isPM = hour >= 12;
  const ampmEN = isPM ? 'PM' : 'AM';
  hour = hour % 12 || 12;

  if (language === 'ko') {
    return m === '00' ? `${hour}시` : `${hour}시 ${m}분`;
  } else {
    return m === '00' ? `${hour} ${ampmEN}` : `${hour}:${m} ${ampmEN}`;
  }
};
