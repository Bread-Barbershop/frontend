import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType3({
  currentYear,
  currentMonth,
  calendarDays,
  headerDays,
  language,
  time,
}: CalendarTemplateProps) {
  const monthText =
    language === 'ko'
      ? `${currentMonth}`
      : new Date(currentYear, currentMonth - 1).toLocaleString('en-US', {
          month: 'short',
        });

  const getEngShortTime = () => {
    if (!time) return { timeText: undefined, ampm: undefined };
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return {
      timeText: `${displayHour}:${mStr}`,
      ampm,
    };
  };
  const { timeText, ampm } = getEngShortTime();

  return (
    <div className="w-full max-w-[340px] px-4 bg-white flex flex-col shadow-[0px_4px_24px_rgba(0,0,0,0.06)]">
      <p className="flex items-center justify-end h-11 text-sm font-semibold text-[#1C2023]">
        {currentYear}
      </p>
      <div className="text-6xl font-serif text-[#1C2023] leading-none tracking-tight mb-2 ml-3">
        {monthText}
      </div>

      <div className="grid grid-cols-7">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="flex-center text-center font-medium font-serif text-[#6B7280] h-8"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className={cn(
                'relative flex flex-col items-center justify-start text-sm font-serif z-10 h-11',
                dayObj.isCurrentMonth ? 'text-[#4A4A4A]' : 'text-[#D4D4D4]',
                dayObj.isTargetDate ? 'text-white' : '',
                dayObj.isTargetDate && 'bg-[#F28B82]'
              )}
            >
              <span>{dayObj.num}</span>
              {dayObj.isTargetDate && (
                <div className="bottom-1 w-full text-center flex flex-col items-center">
                  <span className="text-[8.5px] font-sans text-white/90 leading-[1.1] block">
                    {timeText}
                  </span>
                  <span className="text-[8.5px] font-sans text-white/90 leading-[1.1] block">
                    {ampm}
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
