import React, { useEffect, useState, useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

interface Props {
  date: string; // ISO format
  time?: string;
}

export function DDayCountdown({ date, time }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [targetName, _setTargetName] = useState('000 · 000'); // TODO: Replace with real data if available

  // 1. 목표 날짜(Target Date) 객체를 date와 time이 변경될 때만 한 번 계산
  const targetDate = useMemo(() => {
    // date가 유효한 10자리 형식이 아니면 (예: 입력 중) null 반환
    if (!date || date.length !== 10) return null;

    const baseDate = new Date(`${date}T00:00:00`);

    let hours = 12; // 기본값: 오후 12시
    let minutes = 0;

    if (time) {
      // 정규식으로 시간, 분 추출 (예: "오전 10:30", "14:00" 모두 매칭 가능)
      const isPM = time.includes('오후') || time.toLowerCase().includes('pm');
      const timeMatch = time.match(/(\d{1,2}):(\d{2})/);

      if (timeMatch) {
        let parsedHour = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);

        // 24시간제 변환 ("오후"이면서 12시가 아니면 +12, "오전"이면서 12시면 0)
        if (isPM && parsedHour !== 12 && parsedHour < 12) parsedHour += 12;
        if (!isPM && parsedHour === 12) parsedHour = 0;
        hours = parsedHour;
      }
    }

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }, [date, time]);

  // 2. 카운트다운 타이머 동작 (타겟 날짜가 있을 때만 실행)
  useEffect(() => {
    if (!targetDate) {
      // 컴포넌트 마운트 이후 비동기적으로(timeout) 영점화하여 cascaded render 경고 회피
      const resetTimer = setTimeout(() => {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const updateCountdown = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown(); // 렌더링 직후 즉시 먼저 한 번 실행
    const intervalTimer = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalTimer); // 언마운트 시 클린업(Cleanup) 보장
  }, [targetDate]);

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        'w-full border-t border-border-divider py-6 px-6 flex flex-col items-center justify-center gap-4 bg-white'
      )}
    >
      <div className="flex w-full justify-between items-center text-center">
        <div className="flex flex-col gap-1 items-center w-1/4">
          <span className="text-[#8e8e8e] text-xs font-serif tracking-wider">
            DAYS
          </span>
          <span className="text-[#8e8e8e] text-base font-serif">
            {padZero(timeLeft.days)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center w-1/4">
          <span className="text-[#8e8e8e] text-xs font-serif tracking-wider">
            HOUR
          </span>
          <span className="text-[#8e8e8e] text-base font-serif">
            {padZero(timeLeft.hours)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center w-1/4">
          <span className="text-[#8e8e8e] text-xs font-serif tracking-wider">
            MIN
          </span>
          <span className="text-[#8e8e8e] text-base font-serif">
            {padZero(timeLeft.minutes)}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-center w-1/4">
          <span className="text-[#8e8e8e] text-xs font-serif tracking-wider">
            SEC
          </span>
          <span className="text-[#8e8e8e] text-base font-serif">
            {padZero(timeLeft.seconds)}
          </span>
        </div>
      </div>
      <div className="text-[#8e8e8e] text-sm tracking-tight font-medium w-full text-center">
        {targetName}의 결혼식이 {timeLeft.days}일 남았습니다.
      </div>
    </div>
  );
}
