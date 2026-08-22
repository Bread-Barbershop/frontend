import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType1({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
  accentColor,
}: CalendarTemplateProps) {
  return (
    <div className="flex flex-col w-full font-lineseed">
      <div className="flex items-end justify-center mb-6 ">
        <h3 className="text-xl font-semibold text-text-primary tracking-wider hidden">
          {currentYear}. {currentMonth.toString().padStart(2, '0')}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 mb-4">
        {headerDays.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'text-center font-bold text-sm text-text-tertiary',
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
                'flex items-center justify-center relative z-1 transition-colors w-8 h-8 text-sm text-text-tertiary',
                !dayObj.isCurrentMonth && 'opacity-30'
              )}
              style={idx % 7 === 0 ? { color: accentColor } : undefined}
            >
              <span
                className={cn(
                  'flex items-center justify-center leading-none',
                  dayObj.isTargetDate && 'size-5.5 rounded-full text-white'
                )}
                style={
                  dayObj.isTargetDate
                    ? { backgroundColor: accentColor }
                    : undefined
                }
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
