import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from '../types/calendar';
import { getWeekdayStr } from '../utils/utils';

export function CalendarType5({
  currentYear,
  calendarDays,
  language,
  monthText,
  targetLabel,
  timeLabel,
  pointColor,
}: CalendarTemplateProps) {
  const color = pointColor || '#FA7564';

  return (
    <div className="w-full flex flex-col font-lineseed">
      <div className="flex flex-col items-center">
        <span className="h-11 text-[#1f2937] mb-1">{currentYear}</span>
        <h3 className="h-16 text-[44px] font-bold text-[#1f2937] tracking-wider leading-none">
          {monthText}
        </h3>
      </div>

      <div className="w-full flex flex-col gap-2">
        {calendarDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;
          return (
            <div
              key={idx}
              className="w-full h-11 shrink-0 flex items-center justify-between py-2 border-b border-[#EAEAEA] text-[#1f2937]"
              style={isTarget ? { color } : undefined}
            >
              <div className="flex items-center gap-3">
                <span className={cn('w-8 text-sm font-bold')}>
                  {getWeekdayStr(dayObj.originalDate, language)}
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
