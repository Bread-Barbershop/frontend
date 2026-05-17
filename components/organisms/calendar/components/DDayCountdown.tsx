import { useEffect, useState, useMemo } from 'react';

import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { cn } from '@/shared/utils/cn';

interface Props {
  date: string;
  messageJson?: string;
  time?: string;
}

export function DDayCountdown({ date, time, messageJson }: Props) {
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

  // 1. 목표 날짜(Target Date) 객체를 date와 time이 변경될 때만 한 번 계산
  const targetDate = useMemo(() => {
    // date가 유효한 10자리 형식이 아니면 (예: 입력 중) null 반환
    if (!date || date.length !== 10) return null;

    const [year, month, day] = date.split('-').map(Number);
    const timeMatch = time?.match(/(\d{1,2}):(\d{2})/);
    const isPM = time?.includes('오후') || time?.toLowerCase().includes('pm');

    const { h, m } = timeMatch
      ? (() => {
          const rawH = parseInt(timeMatch[1], 10);
          const rawM = parseInt(timeMatch[2], 10);
          const adjustedH =
            isPM && rawH < 12 ? rawH + 12 : !isPM && rawH === 12 ? 0 : rawH;
          return { h: adjustedH, m: rawM };
        })()
      : { h: 12, m: 0 };

    return new Date(year, month - 1, day, h, m, 0, 0);
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
        'w-full border-t border-border-divider py-6 px-6 flex flex-col items-center justify-center gap-4 bg-white font-bold'
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
      {messageJson && <PreviewBody html={messageJson} />}
      {!messageJson && (
        <div className="text-[#8e8e8e] text-sm tracking-tight w-full text-center">
          {timeLeft.days}일 남았습니다.
        </div>
      )}
    </div>
  );
}
