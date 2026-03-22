import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType2({
  calendarDays,
  headerDays,
}: CalendarTemplateProps) {
  return (
    <div className="w-full max-w-[340px] bg-white flex flex-col rounded-xl">
      <div className="grid grid-cols-7 gap-y-4 gap-x-1">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center font-medium text-sm font-serif text-[#6B7280]"
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
                  'flex items-center justify-center relative z-1 transition-colors w-full h-full text-sm font-serif',
                  dayObj.isCurrentMonth ? 'text-[#4A4A4A]' : 'text-[#D4D4D4]',
                  dayObj.isTargetDate ? 'text-white' : ''
                )}
              >
                {dayObj.num}
                {dayObj.isTargetDate && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5.5 -z-1 bg-[#F28B82] rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
