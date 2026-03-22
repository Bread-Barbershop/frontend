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
    <div className="w-full max-w-[340px] bg-transparent flex flex-col font-serif">
      <div className="flex flex-col items-center mb-6">
        <span className="text-[14px] text-[#4A4A4A] mb-1 font-sans">
          {currentYear}
        </span>
        <h3 className="text-[38px] font-semibold text-[#2A313A] tracking-wider leading-none">
          {monthStr}
        </h3>
      </div>

      <div className="w-full flex flex-col border-t border-[#EAEAEA]">
        {calendarDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;
          return (
            <div
              key={idx}
              className={cn(
                'w-full h-[72px] shrink-0 flex items-center justify-between border-b border-[#EAEAEA] px-4',
                isTarget ? 'text-[#F28B82]' : 'text-[#2A313A]'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-[13px] font-semibold w-8 text-right',
                    isTarget ? '' : 'text-[#6A7178]'
                  )}
                >
                  {getDayStr(dayObj.originalDate)}
                </span>
                <span className="text-[42px] font-semibold leading-none">
                  {dayObj.num}
                </span>
              </div>

              {isTarget && (
                <div className="flex flex-col items-center justify-center text-[13px] font-sans leading-tight">
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
