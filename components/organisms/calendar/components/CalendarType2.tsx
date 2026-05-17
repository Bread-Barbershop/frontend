import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType2({
  calendarDays,
  headerDays,
}: CalendarTemplateProps) {
  return (
    <div className="w-full flex flex-col font-lineseed">
      <div className="grid grid-cols-7 gap-y-4 gap-x-1">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center font-medium text-sm text-text-tertiary"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className="flex items-center justify-center flex-col relative h-10"
            >
              <div
                className={cn(
                  'flex items-center justify-center relative z-1 transition-colors w-full h-full text-sm text-text-tertiary',
                  dayObj.isCurrentMonth && 'text-text-primary',
                  dayObj.isTargetDate && 'text-white'
                )}
              >
                {dayObj.num}
                {dayObj.isTargetDate && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5.5 -z-1 bg-text-wedding rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
