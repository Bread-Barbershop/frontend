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

  const prevMonthLastDay = new Date(displayYear, displayMonth, 0).getDate();

  const days: CalendarDayInfo[] = [];

  // Previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      num: prevMonthLastDay - i,
      isCurrentMonth: false,
      isTargetDate: false,
      originalDate: new Date(
        displayYear,
        displayMonth - 1,
        prevMonthLastDay - i
      ),
    });
  }

  // Current month's days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    days.push({
      num: i,
      isCurrentMonth: true,
      isTargetDate: monthOffset === 0 && i === baseDay,
      originalDate: new Date(displayYear, displayMonth, i),
    });
  }

  // Calculate whether we need 5 rows (35 days) or 6 rows (42 days)
  const totalCellsNeeded = startingDayOfWeek + totalDaysInMonth <= 35 ? 35 : 42;

  // Next month's days (Fill up to 35 or 42 cells grid)
  const remainingDays = totalCellsNeeded - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      num: i,
      isCurrentMonth: false,
      isTargetDate: false,
      originalDate: new Date(displayYear, displayMonth + 1, i),
    });
  }

  return days;
};
