import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType3({
  currentYear,
  calendarDays,
  headerDays,
  timeInfo,
  monthText,
  accentColor,
}: CalendarTemplateProps) {
  const color = pointColor || '#FA7564';

  return (
    <div className="w-full px-4 flex flex-col shadow-[0px_4px_24px_rgba(0,0,0,0.06)] font-lineseed">
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
            className="flex-center text-center font-medium font-lineseed text-[#6B7280] h-8 mb-3"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                'relative flex flex-col items-center justify-start text-sm font-lineseed z-1 h-11 text-text-tertiary',
                !dayObj.isCurrentMonth && 'opacity-30',
                dayObj.isTargetDate && 'text-white'
              )}
              style={
                dayObj.isTargetDate
                  ? { backgroundColor: accentColor }
                  : undefined
              }
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
