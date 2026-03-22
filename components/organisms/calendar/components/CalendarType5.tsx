import { cn } from '@/shared/utils/cn';

import { ENG_DAYS, KOR_DAYS } from '../utils';

import { CalendarTemplateProps } from './types';

export function CalendarType5({
  currentYear,
  currentMonth,
  calendarDays,
  time,
  language,
}: CalendarTemplateProps) {
  const monthNamesEN = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthStr =
    language === 'en' ? monthNamesEN[currentMonth - 1] : `${currentMonth}월`;

  const getDayStr = (date: Date) => {
    const dayIndex = date.getDay();
    if (language === 'ko') {
      return KOR_DAYS[dayIndex];
    } else {
      return ENG_DAYS[dayIndex].toUpperCase();
    }
  };

  const getFormatTime = (timeStr?: string) => {
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

  const targetLabel = language === 'ko' ? '결혼식' : 'Wedding day';
  const timeLabel = getFormatTime(time);

  return (
    <div className="w-full flex flex-col font-maruburi">
      <div className="flex flex-col items-center">
        <span className="h-11 text-[#1f2937] mb-1">{currentYear}</span>
        <h3 className="h-16 text-[44px] font-bold text-[#1f2937] tracking-wider leading-none">
          {monthStr}
        </h3>
      </div>

      <div className="w-full flex flex-col">
        {calendarDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;
          return (
            <div
              key={idx}
              className={cn(
                'w-full h-11 shrink-0 flex items-center justify-between py-2 border-b border-[#EAEAEA] text-[#1f2937]',
                isTarget && 'text-text-wedding'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('w-8 text-sm font-bold')}>
                  {getDayStr(dayObj.originalDate)}
                </span>
                <span className="w-12 text-[44px] font-bold text-center leading-none">
                  {dayObj.num}
                </span>
              </div>

              {isTarget && (
                <div className="flex flex-col flex-1 items-center justify-center text-sm font-bold leading-tight">
                  <span className="mb-0.5">{targetLabel}</span>
                  <span>{timeLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
