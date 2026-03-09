import React, { useMemo, useRef } from 'react';

import { cn } from '@/shared/utils/cn';

import { CalendarTemplateProps } from './types';

export function CalendarType2({
  calendarDays,
  monthOffset,
  setMonthOffset,
  headerDays,
}: CalendarTemplateProps) {
  const touchStartX = useRef(0);

  // Type 2 (주간 뷰): 딱 7일만 잘라서 렌더링하는 배열 추출
  const displayDays = useMemo(() => {
    if (monthOffset === 0) {
      // D-Day가 포함된 주(Week) 찾기
      const targetIdx = calendarDays.findIndex(d => d.isTargetDate);
      if (targetIdx !== -1) {
        const startIdx = Math.floor(targetIdx / 7) * 7;
        return calendarDays.slice(startIdx, startIdx + 7);
      }
    }

    // offset 변경으로 현재 달에 D-Day가 없으면, 1일이 포함된 주를 반환
    const firstDayIdx = calendarDays.findIndex(
      d => d.isCurrentMonth && d.num === 1
    );
    const startIdx = firstDayIdx !== -1 ? Math.floor(firstDayIdx / 7) * 7 : 0;
    return calendarDays.slice(startIdx, startIdx + 7);
  }, [calendarDays, monthOffset]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX.current - touchEndX > 50) {
      setMonthOffset(prev => prev + 1);
    }
    if (touchEndX - touchStartX.current > 50) {
      setMonthOffset(prev => prev - 1);
    }
  };

  return (
    <div
      className="w-full max-w-[340px] bg-white flex flex-col rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="grid grid-cols-7 gap-y-4 gap-x-1">
        {headerDays.map((day, idx) => (
          <div
            key={`${day}-${idx}`}
            className="text-center font-medium text-sm font-serif text-[#6B7280]"
          >
            {day}
          </div>
        ))}

        {displayDays.map((dayObj, idx) => {
          return (
            <div
              key={idx}
              className="flex items-center justify-center flex-col relative h-10"
            >
              <div
                className={cn(
                  'flex items-center justify-center relative z-10 transition-colors w-full h-full text-sm font-serif',
                  dayObj.isCurrentMonth ? 'text-[#4A4A4A]' : 'text-[#D4D4D4]',
                  dayObj.isTargetDate ? 'text-white' : ''
                )}
              >
                {dayObj.num}
                {dayObj.isTargetDate && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5.5 -z-10 bg-[#F28B82] rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
