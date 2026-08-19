import { Fragment } from 'react/jsx-runtime';

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
  accentColor,
}: CalendarTemplateProps) {
  return (
    <div className="w-full flex flex-col font-lineseed gap-1">
      <div className="flex flex-col items-center">
        <div className="flex-center h-11">
          <span className="text-[#1f2937] mb-1">{currentYear}</span>
        </div>
        <div className="flex-center h-17">
          <h3 className="text-[44px] font-bold text-[#1f2937] tracking-wider leading-none">
            {monthText}
          </h3>
        </div>
      </div>

      <div className="w-full flex flex-col gap-1">
        {calendarDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;
          return (
            <Fragment key={dayObj.num + '-' + idx}>
              <div
                key={idx}
                className={cn(
                  'w-full h-11 shrink-0 flex items-center justify-between text-[#1f2937]',
                  isTarget && 'text-text-wedding'
                )}
                style={isTarget ? { color: accentColor } : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('w-8 text-sm font-bold')}>
                    {getWeekdayStr(dayObj.originalDate, language)}
                  </span>

                  <span className="w-12 justify-center text-[44px] font-bold text-center leading-none pt-2.5">
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
              {idx !== calendarDays.length - 1 && (
                <hr className="w-full border-[#EAEAEA]" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
