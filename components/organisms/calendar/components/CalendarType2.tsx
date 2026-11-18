import { cn } from '@/shared/utils/cn';
import { getContrastingTextColor } from '@/shared/utils/invitationBackgroundColor';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType2({
  calendarDays,
  headerDays,
  accentColor,
}: CalendarTemplateProps) {
  const selectedDayStyle = {
    backgroundColor: accentColor,
    color: getContrastingTextColor(accentColor),
  };

  return (
    <div className="w-full flex flex-col font-lineseed">
      <div className="grid grid-cols-7 gap-y-1 gap-x-1">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center font-medium text-sm text-[color:var(--calendar-muted-text,var(--color-text-tertiary))]"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className="flex items-center justify-center flex-col relative h-5.5"
            >
              <div
                className={cn(
                  'flex items-center justify-center relative z-1 transition-colors w-full h-full text-sm',
                  dayObj.isCurrentMonth
                    ? 'text-[color:var(--calendar-text,var(--color-text-primary))]'
                    : 'text-[color:var(--calendar-muted-text,var(--color-text-tertiary))]'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center leading-none',
                    dayObj.isTargetDate && 'size-5.5 rounded-full'
                  )}
                  style={dayObj.isTargetDate ? selectedDayStyle : undefined}
                >
                  <span
                    className={cn(
                      'block leading-none',
                      dayObj.isTargetDate && 'translate-y-0.5'
                    )}
                  >
                    {dayObj.num}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
