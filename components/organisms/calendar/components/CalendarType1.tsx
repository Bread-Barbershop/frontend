import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType1({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
}: CalendarTemplateProps) {
  return (
    <div className="w-full max-w-[340px] bg-transparent flex flex-col">
      <div className="flex items-end mb-6 justify-center">
        <h3 className="text-xl font-semibold text-[#4A4A4A] tracking-wider hidden">
          {currentYear}. {currentMonth.toString().padStart(2, '0')}
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 mb-4">
        {headerDays.map(day => (
          <div
            key={day}
            className="text-center font-semibold text-[15px] text-[#8A8A8A]"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => (
          <div
            key={idx}
            className="flex items-center justify-center flex-col relative aspect-square h-5.5"
          >
            <div
              className={cn(
                'flex items-center justify-center relative z-1 transition-colors w-8 h-8 text-[15px]',
                dayObj.isCurrentMonth ? 'text-[#4A4A4A]' : 'text-[#D4D4D4]',
                dayObj.isTargetDate ? 'text-white' : ''
              )}
            >
              {dayObj.num}
              {dayObj.isTargetDate && (
                <div className="absolute size-5.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 bg-[#F28B82] rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
