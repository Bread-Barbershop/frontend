import React, { useEffect, useRef } from 'react';

import { cn } from '@/shared/utils/cn';

import { ENG_DAYS, KOR_DAYS } from '../utils';

import { CalendarTemplateProps } from './types';

export function CalendarType5({
  currentYear,
  currentMonth,
  calendarDays,
  time,
  language,
}: CalendarTemplateProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowHeight = 72; // h-[72px]

  // 타겟 날짜를 찾고, 해당 날짜 기준 -5일 ~ +5일의 배열을 만듭니다.
  let displayDays: typeof calendarDays = [];
  const targetIndex = calendarDays.findIndex(day => day.isTargetDate);

  if (targetIndex !== -1) {
    const targetDate = calendarDays[targetIndex].originalDate;
    
    for (let i = -5; i <= 5; i++) {
      const d = new Date(targetDate);
      d.setDate(d.getDate() + i);
      
      displayDays.push({
        num: d.getDate(),
        isCurrentMonth: d.getMonth() === currentMonth - 1,
        isTargetDate: i === 0,
        originalDate: d,
      });
    }
  } else {
    // 타겟일이 없는 경우 기본적으로 앞 11일을 보여줌
    displayDays = calendarDays.slice(0, 11);
  }

  useEffect(() => {
    // 이제 총 11개의 항목(-5 ~ +5)이 렌더링 됩니다.
    // 타겟일(인덱스 5)이 화면의 5번째 위치(가장 아래쪽)에 보이도록 만들려면:
    // 인덱스 0일 때: scrollTop = 0 (1~5번째 항목 노출)
    // 타겟일 인덱스(5)가 화면 5번째 줄에 오려면, 스크롤의 첫 줄은 인덱스 1이어야 합니다.
    // 즉, `scrollTop`은 1 * rowHeight 가 됩니다.
    if (targetIndex !== -1 && scrollRef.current) {
      scrollRef.current.scrollTop = 1 * rowHeight;
    }
  }, [displayDays, targetIndex, rowHeight]);

  const monthNamesEN = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthStr =
    language === 'en' ? monthNamesEN[currentMonth - 1] : `${currentMonth}월`;

  const getDayStr = (date: Date) => {
    const dayIndex = date.getDay();
    if (language === 'ko') {
      return KOR_DAYS[dayIndex]; // e.g., '월'
    } else {
      return ENG_DAYS[dayIndex].toUpperCase(); // e.g., 'MON'
    }
  };

  const getFormatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const isPM = hour >= 12;
    const ampmEN = isPM ? 'PM' : 'AM';
    hour = hour % 12 || 12;

    if (language === 'ko') {
      return m === '00' ? `${hour}시` : `${hour}시 ${m}분`;
    } else {
      return m === '00' ? `${hour} ${ampmEN}` : `${hour}:${m} ${ampmEN}`;
    }
  };

  const targetLabel = language === 'ko' ? '결혼식' : 'Wedding day';
  const timeLabel = getFormatTime(time);

  return (
    <div className="w-full max-w-[340px] bg-transparent flex flex-col font-serif">
      <div className="flex flex-col items-center mb-6">
        <span className="text-[14px] text-[#4A4A4A] mb-1 font-sans">
          {currentYear}
        </span>
        <h3 className="text-[38px] font-semibold text-[#2A313A] tracking-wider leading-none">
          {monthStr}
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="w-full h-[360px] overflow-y-auto hide-scroll flex flex-col border-t border-[#EAEAEA]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .hide-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {displayDays.map((dayObj, idx) => {
          const isTarget = dayObj.isTargetDate;
          return (
            <div
              key={idx}
              className={cn(
                'w-full h-[72px] shrink-0 flex items-center justify-between border-b border-[#EAEAEA] px-4',
                isTarget ? 'text-[#F28B82]' : 'text-[#2A313A]'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-[13px] font-semibold w-8 text-right',
                    isTarget ? '' : 'text-[#6A7178]'
                  )}
                >
                  {getDayStr(dayObj.originalDate)}
                </span>
                <span className="text-[42px] font-semibold leading-none">
                  {dayObj.num}
                </span>
              </div>

              {isTarget && (
                <div className="flex flex-col items-center justify-center text-[13px] font-sans leading-tight">
                  <span className="mb-0.5">{targetLabel}</span>
                  <span>{timeLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
