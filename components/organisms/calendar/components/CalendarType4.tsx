import React from 'react';



import { CalendarTemplateProps } from './types';

export function CalendarType4({
  currentMonth,
  calendarDays,
  headerDays,
}: CalendarTemplateProps) {
  const monthNamesEN = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  // Find the target date index
  const targetIndex = calendarDays.findIndex(day => day.isTargetDate);
  
  let displayDays = [];

  if (targetIndex !== -1) {
    const targetDay = calendarDays[targetIndex];
    const targetDayOfWeek = targetDay.originalDate.getDay(); // 0(Sun) ~ 6(Sat)
    
    // 타겟일이 속한 주의 일요일 인덱스
    const currentWeekSundayIndex = targetIndex - targetDayOfWeek;
    // 그 전주의 일요일 인덱스 (항상 7일 전)
    const previousWeekSundayIndex = currentWeekSundayIndex - 7;
    
    if (previousWeekSundayIndex >= 0) {
      displayDays = calendarDays.slice(previousWeekSundayIndex, targetIndex + 1);
    } else {
      // calendarDays 범위를 벗어난 경우 (월 초반이라 이전 달 일요일이 배열에 없는 경우)
      // 필요한 만큼 날짜를 앞에 채워줌
      const missingDaysCount = Math.abs(previousWeekSundayIndex);
      const firstAvailableDay = calendarDays[0].originalDate;
      
      const missingDays = [];
      for (let i = missingDaysCount; i > 0; i--) {
        const d = new Date(firstAvailableDay);
        d.setDate(d.getDate() - i);
        missingDays.push({
          num: d.getDate(),
          isCurrentMonth: false,
          isTargetDate: false,
          originalDate: d,
        });
      }
      
      displayDays = [...missingDays, ...calendarDays.slice(0, targetIndex + 1)];
    }

    // 만약 타겟일까지의 배열이 14일 미만이라면, 타겟일 이후의 날짜들도 보여줘서 14일을 꽉 채움
    if (displayDays.length < 14) {
      const remainingDaysCount = 14 - displayDays.length;
      const lastAvailableIndex = targetIndex + remainingDaysCount;
      
      if (lastAvailableIndex < calendarDays.length) {
        // 배열 안에 여유가 있다면 배열에서 더 가져옴
        const additionalDays = calendarDays.slice(targetIndex + 1, lastAvailableIndex + 1);
        displayDays = [...displayDays, ...additionalDays];
      } else {
        // 배열 범위를 넘어설 경우 (월말 등) 직접 계산해서 채워줌
        const availableAdditionalDays = calendarDays.slice(targetIndex + 1);
        displayDays = [...displayDays, ...availableAdditionalDays];
        
        const stillMissingCount = 14 - displayDays.length;
        if (stillMissingCount > 0) {
          const lastDate = displayDays[displayDays.length - 1].originalDate;
          const extraMissingDays = [];
          for (let i = 1; i <= stillMissingCount; i++) {
            const d = new Date(lastDate);
            d.setDate(d.getDate() + i);
            extraMissingDays.push({
              num: d.getDate(),
              isCurrentMonth: false,
              isTargetDate: false,
              originalDate: d,
            });
          }
          displayDays = [...displayDays, ...extraMissingDays];
        }
      }
    }
  } else {
    // 타겟일이 없는 경우 기본으로 첫 2주 보여주기
    displayDays = calendarDays.slice(0, 14);
  }

  return (
    <div className="w-full max-w-[340px] bg-transparent flex flex-col items-center font-serif">
      <div className="mb-10 mt-2">
        <h3 className="text-[38px] md:text-[42px] font-normal text-[#1A202C] tracking-wide uppercase">
          {monthNamesEN[currentMonth - 1]}
        </h3>
      </div>

      <div className="grid grid-cols-7 w-full gap-y-6">
        {headerDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-[12px] text-[#A0AEC0] font-sans font-medium"
          >
            {day}
          </div>
        ))}

        {displayDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;

          return (
            <div
              key={dayObj.num + '-' + idx}
              className="flex items-center justify-center relative aspect-square h-8 mx-auto"
            >
              <div className="flex items-center justify-center relative z-1 text-[16px] text-[#2D3748]">
                {dayObj.num}
                {isTarget && (
                  <svg
                    className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-[48%] -translate-y-[52%] text-[#D92D20] -z-1"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
