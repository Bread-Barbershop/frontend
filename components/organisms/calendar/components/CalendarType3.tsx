import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType3({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
  language,
  timeInfo,
}: CalendarTemplateProps) {
  const monthText =
    language === 'ko'
      ? `${currentMonth}`
      : new Date(currentYear, currentMonth - 1).toLocaleString('en-US', {
          month: 'short',
        });

  return (
    <div className="w-full px-4 flex flex-col shadow-[0px_4px_24px_rgba(0,0,0,0.06)] font-maruburi">
      <p className="flex items-center justify-end h-11 text-sm font-semibold text-[#1f2937] font-pretendard">
        {currentYear}
      </p>
      <div className="text-6xl  text-[#111827] leading-none tracking-tight mb-2 ml-3 ">
        {monthText}
      </div>

      <div className="grid grid-cols-7">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="flex-center text-center font-medium font-maruburi text-[#6B7280] h-8"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                'relative flex flex-col items-center justify-start text-sm font-maruburi z-1 h-11',
                dayObj.isCurrentMonth ? 'text-[#4A4A4A]' : 'text-[#D4D4D4]',
                dayObj.isTargetDate && 'text-white',
                dayObj.isTargetDate && 'bg-text-wedding'
              )}
            >
              <span>{dayObj.num}</span>
              {dayObj.isTargetDate && (
                <div className="bottom-1 w-full text-center flex flex-col items-center">
                  <span className="text-[11px] font-sans text-white leading-[1.1] block">
                    {timeInfo.timeText}
                  </span>
                  <span className="text-[11px] font-sans text-white leading-[1.1] block">
                    {timeInfo.ampm}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
