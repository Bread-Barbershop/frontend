import { cn } from '@/shared/utils/cn';
import { getContrastingTextColor } from '@/shared/utils/invitationBackgroundColor';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType1({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
  accentColor,
}: CalendarTemplateProps) {
  const selectedDayStyle = {
    backgroundColor: accentColor,
    color: getContrastingTextColor(accentColor),
  };

  return (
    <div className="flex flex-col w-full font-lineseed">
      <div className="flex items-end justify-center mb-6 ">
        <h3 className="text-xl font-semibold text-[color:var(--calendar-text,var(--color-text-primary))] tracking-wider hidden">
          {currentYear}. {currentMonth.toString().padStart(2, '0')}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 mb-4">
        {headerDays.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'text-center font-bold text-sm text-[color:var(--calendar-muted-text,var(--color-text-tertiary))]',
              idx === 0 && 'text-text-wedding'
            )}
            style={idx === 0 ? { color: accentColor } : undefined}
          >
            {day}
          </div>
        ))}
        {calendarDays.map((dayObj, idx) => (
          <div
            key={idx}
            className="relative flex items-center justify-center h-5.5"
          >
            <div
              className={cn(
                'flex items-center justify-center relative z-1 transition-colors w-8 h-8 text-sm',
                dayObj.isCurrentMonth
                  ? 'text-[color:var(--calendar-text,var(--color-text-tertiary))]'
                  : 'text-[color:var(--calendar-muted-text,var(--color-text-tertiary))] opacity-[var(--calendar-outside-month-opacity,0.3)]'
              )}
              style={idx % 7 === 0 ? { color: accentColor } : undefined}
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
        ))}
      </div>
    </div>
  );
}
