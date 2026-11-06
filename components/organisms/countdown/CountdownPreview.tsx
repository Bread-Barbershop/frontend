'use client';

import { useEffect, useState } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import { getCountdownTime } from './countdownTime';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'countdown'>;
  isGuestPage?: boolean;
  titleClassName?: string;
}

const UNITS = [
  { key: 'days', label: 'DAYS' },
  { key: 'hours', label: 'HOURS' },
  { key: 'minutes', label: 'MIN' },
  { key: 'seconds', label: 'SEC' },
] as const;

export function CountdownPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  const { title, eventDateTime, onDayMessage, afterMessage } = blockInfo.props;
  const remaining = getCountdownTime(eventDateTime, now ?? Number.NaN);
  const values = {
    days: remaining.days,
    hours: remaining.hours,
    minutes: remaining.minutes,
    seconds: remaining.seconds,
  };
  const message = remaining.status === 'today'
    ? (onDayMessage || '오늘은 특별한 날입니다!')
    : (afterMessage || '함께해 주셔서 감사합니다.');

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      mainTitle={title}
      mainTitleDefault="우리의 특별한 날"
      {...rest}
    >
      {remaining.status === 'unset' ? (
        !isGuestPage && <p className="text-xs text-text-tertiary">행사 날짜를 입력하면 카운트다운이 표시됩니다.</p>
      ) : remaining.status === 'before' ? (
        <div className="grid w-full grid-cols-4 gap-2 px-1" role="timer" aria-label="행사까지 남은 시간">
          {UNITS.map(unit => (
            <div key={unit.key} className="flex min-w-0 flex-col items-center gap-1 rounded-lg bg-[#FAFAFB] py-3">
              <span className="text-2xl font-semibold tabular-nums text-text-primary">
                {String(values[unit.key]).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider text-text-secondary">{unit.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words px-3 text-center text-sm leading-relaxed text-text-primary">{message}</p>
      )}
    </MiddlePreviewWrapper>
  );
}
