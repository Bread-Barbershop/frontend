import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType2({
  calendarDays,
  headerDays,
  pointColor,
}: CalendarTemplateProps) {
  const color = pointColor || '#FA7564';

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
                <span
                  className={cn(
                    'flex items-center justify-center leading-none',
                    dayObj.isTargetDate && 'size-5.5 rounded-full text-white'
                  )}
                  style={
                    dayObj.isTargetDate ? { backgroundColor: color } : undefined
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
          );
        })}
      </div>
    </div>
  );
}
