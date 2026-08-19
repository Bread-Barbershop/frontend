import { CalendarTemplateProps } from '../types/calendar';

export function CalendarType4({
  calendarDays,
  headerDays,
  monthText,
  pointColor,
}: CalendarTemplateProps) {
  const color = pointColor || '#FA7564';

  return (
    <div className="w-full flex flex-col items-center font-lineseed">
      <h3 className="h-[68px] text-[44px] text-[#111827] tracking-wide uppercase mb-1">
        {monthText}
      </h3>

      <div className="grid grid-cols-7 w-full gap-y-6">
        {headerDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-[12px] text-[#A0AEC0] font-sans font-medium"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;

          return (
            <div
              key={dayObj.num + '-' + idx}
              className="flex items-center justify-center relative aspect-square h-8 mx-auto"
            >
              <div className="relative flex size-8 items-center justify-center text-[16px] text-[#2D3748]">
                {isTarget && (
                  <svg
                    className="pointer-events-none absolute left-1/2 top-1/2 size-9 -translate-x-[48%] -translate-y-[52%]"
                    style={{ color }}
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 7C14 7 5 15 6 26C8 36 17 44 28 43C38 41 45 32 43 21C42 12 34 6 25 6.5C23 6.6 20 7.5 19 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                <span className="relative z-1 leading-none">{dayObj.num}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
