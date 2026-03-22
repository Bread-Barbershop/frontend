import { CalendarDayInfo } from './components/types';

export const KOR_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const ENG_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 숫자에 하이픈 자동 삽입 로직
export const addHyphenToDate = (value: string) => {
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);

  return [year, month, day].filter(Boolean).join('-');
};

export const parseTargetDate = (dateStr?: string) => {
  let d = new Date(dateStr || new Date().toISOString());
  if (isNaN(d.getTime())) {
    d = new Date();
  }
  return d;
};

/** 날짜 문자열을 한 번에 파싱하여 필요한 원자 데이터를 반환 */
export const parseDateInfo = (dateStr?: string) => {
  const d = parseTargetDate(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth(), // 0-11
    day: d.getDate(),
    dayOfWeek: d.getDay(), // 0-6
  };
};

// 2026.12.25 형식으로 변환
export const getFormattedStringDate = (
  year: number,
  month: number, // 0-11
  day: number
) => {
  const paddedMonth = (month + 1).toString().padStart(2, '0');
  const paddedDay = day.toString().padStart(2, '0');
  return `${year}.${paddedMonth}.${paddedDay}`;
};

// 토요일 12:00 형식으로 변환
export const getFormattedTimeStr = (
  baseDayOfWeek: number, // 0-6
  timeStr?: string
) => {
  let formattedTime = `${KOR_DAYS[baseDayOfWeek]}요일`;
  if (timeStr) {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const h = parseInt(hoursStr, 10);
    const ampm = h >= 12 ? '오후' : '오전';
    const displayHour = h % 12 || 12;
    const minutePart = minutesStr === '00' ? '' : ` ${minutesStr}분`;

    formattedTime += ` ${ampm} ${displayHour}시${minutePart}`;
  }
  return formattedTime;
};

export const generateCalendarGrid = (
  displayYear: number,
  displayMonth: number,
  baseDay: number,
  monthOffset: number
): CalendarDayInfo[] => {
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const lastDayOfMonth = new Date(displayYear, displayMonth + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // 5행(35일) 또는 6행(42일) 결정
  const totalCells = startingDayOfWeek + totalDaysInMonth <= 35 ? 35 : 42;

  return Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(displayYear, displayMonth, i - startingDayOfWeek + 1);
    return {
      num: d.getDate(),
      isCurrentMonth: d.getMonth() === displayMonth,
      isTargetDate: monthOffset === 0 && d.getMonth() === displayMonth && d.getDate() === baseDay,
      originalDate: d,
    };
  });
};

/**
 * 기준일로부터 특정 오프셋에서 시작하여 지정된 개수만큼의 날짜를 생성합니다.
 */
export const generateDateRange = (
  targetDate: Date,
  startOffset: number,
  count: number,
  displayMonth: number
): CalendarDayInfo[] => {
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(targetYear, targetMonth, targetDay + startOffset + i);
    return {
      num: d.getDate(),
      isCurrentMonth: d.getMonth() === displayMonth,
      isTargetDate:
        d.getFullYear() === targetYear &&
        d.getMonth() === targetMonth &&
        d.getDate() === targetDay,
      originalDate: d,
    };
  });
};

/**
 * 시간 문자열("오전 10:30" 또는 "14:30")을 파싱하여 정제된 시간 정보와 AM/PM을 반환합니다.
 */
export const parseTimeInfo = (timeStr?: string) => {
  if (!timeStr) return { timeText: undefined, ampm: undefined };

  const parts = timeStr.split(' ');
  const timeOnly = parts.length >= 2 ? parts[1] : timeStr;
  const [hStr, mStr] = timeOnly.split(':');
  const hour = parseInt(hStr, 10);

  const isPM = parts.length >= 2 ? parts[0] === '오후' : hour >= 12;
  const displayHour = hour % 12 || 12;

  return {
    timeText: `${displayHour}:${mStr || '00'}`,
    ampm: isPM ? 'PM' : 'AM',
  };
};
