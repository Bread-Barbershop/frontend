import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType1({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
}: CalendarTemplateProps) {
  return (
    <div className="flex flex-col w-full font-maruburi">
      <div className="flex items-end justify-center mb-6 ">
        <h3 className="text-xl font-semibold text-text-primary tracking-wider hidden">
          {currentYear}. {currentMonth.toString().padStart(2, '0')}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-4">
        {headerDays.map((day, idx) => (
          <div
            key={day}
            className={cn(
              'text-center font-bold text-sm text-text-tertiary',
              idx === 0 && 'text-text-wedding'
            )}
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
                idx % 7 === 0 && 'text-text-wedding',
                !dayObj.isCurrentMonth && 'opacity-30',
                dayObj.isTargetDate && 'text-white'
              )}
            >
              {dayObj.num}
              {dayObj.isTargetDate && (
                <div className="absolute size-5.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 bg-text-wedding rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
