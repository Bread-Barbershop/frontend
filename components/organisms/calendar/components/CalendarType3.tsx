import { cn } from '@/shared/utils/cn';
import { getContrastingTextColor } from '@/shared/utils/invitationBackgroundColor';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType3({
  currentYear,
  calendarDays,
  headerDays,
  timeInfo,
  monthText,
  accentColor,
}: CalendarTemplateProps) {
  const selectedDayStyle = {
    backgroundColor: accentColor,
    color: getContrastingTextColor(accentColor),
  };

  return (
    <div className="w-full px-4 flex flex-col shadow-edit font-lineseed">
      <p className="flex items-center justify-end h-11.5 text-sm font-semibold text-[color:var(--calendar-text,#1f2937)] font-pretendard">
        {currentYear}
      </p>
      <div className="flex items-center justify-start h-17 px-3">
        <span className="text-[44px] font-bold text-[color:var(--calendar-text,#111827)] leading-none tracking-tight">
          {monthText}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="flex-center text-center font-medium font-lineseed text-[color:var(--calendar-muted-text,#6B7280)] h-8"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                'relative flex flex-col items-center justify-start text-sm font-lineseed z-1 h-11.5',
                dayObj.isCurrentMonth
                  ? 'text-[color:var(--calendar-text,var(--color-text-tertiary))]'
                  : 'text-[color:var(--calendar-muted-text,var(--color-text-tertiary))] opacity-[var(--calendar-outside-month-opacity,0.3)]'
              )}
              style={dayObj.isTargetDate ? selectedDayStyle : undefined}
            >
              <span>{dayObj.num}</span>
              {dayObj.isTargetDate && (
                <div className="bottom-1 w-full text-center flex flex-col items-center">
                  <span className="text-[11px] font-sans leading-[1.1] block">
                    {timeInfo.timeText}
                  </span>
                  <span className="text-[11px] font-sans leading-[1.1] block">
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
