import { useEffect, useMemo, useState } from 'react';

import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import {
  DAY_MS,
  parseSeoulDateTimeToTimestamp,
  parseStrictDate,
  startOfSeoulDay,
} from '@/shared/utils/dateValidation';

import { parseCalendarClock } from '../utils/utils';

interface Props {
  date: string;
  messageHtml: string;
  showCountdown: boolean;
  isDefaultMessage: boolean;
  time?: string;
  seoulTime?: boolean;
}

const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 24 * 60 * 60;
const summaryClassName =
  'text-[color:var(--calendar-muted-text,#8e8e8e)] text-sm tracking-tight w-full text-center';

function getTargetDate(
  date: string,
  time: string | undefined,
  seoulTime: boolean
) {
  const { hour, minute } = parseCalendarClock(time) ?? { hour: 12, minute: 0 };
  if (seoulTime) {
    const midnight = parseSeoulDateTimeToTimestamp(`${date}T00:00`);
    return midnight === null
      ? null
      : new Date(midnight + (hour * 60 + minute) * 60_000);
  }
  const parts = parseStrictDate(date);
  if (!parts) return null;

  const target = new Date(0);
  target.setFullYear(parts.year, parts.month - 1, parts.day);
  target.setHours(hour, minute, 0, 0);

  return target;
}

export function DDayCountdown({
  date,
  time,
  messageHtml,
  showCountdown,
  isDefaultMessage,
  seoulTime = false,
}: Props) {
  const targetDate = useMemo(
    () => getTargetDate(date, time, seoulTime),
    [date, time, seoulTime]
  );
  const targetTime = targetDate?.getTime();
  const [clock, setClock] = useState<{ now: number; target: number }>();
  const needsClock = showCountdown || messageHtml.includes('(D-Day)');

  useEffect(() => {
    if (!needsClock || targetTime === undefined) return;

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = Date.now();
      setClock({ now, target: targetTime });
      const remaining = targetTime - now;
      if (remaining > 0) {
        const nextUpdate = showCountdown
          ? MS_PER_SECOND
          : (seoulTime
              ? startOfSeoulDay(now) + DAY_MS
              : new Date(now).setHours(24, 0, 0, 0)) - now;
        timer = setTimeout(tick, Math.min(nextUpdate, remaining));
      }
    };

    // Read the client clock after hydration so the initial markup stays stable.
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [targetTime, needsClock, showCountdown, seoulTime]);

  const hasText = Boolean(
    messageHtml.replace(/<[^>]*>|&(?:nbsp|#160|#xa0);/gi, '').trim()
  );
  if (!needsClock) return hasText ? <PreviewBody html={messageHtml} /> : null;

  if (!targetDate || !clock || clock.target !== targetTime) return null;

  const remaining = clock.target - clock.now;
  const ended = remaining <= 0;
  const totalSeconds = Math.floor(remaining / MS_PER_SECOND);
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const segments = [
    ['DAYS', days],
    ['HOUR', Math.floor(totalSeconds / 3600) % 24],
    ['MIN', Math.floor(totalSeconds / 60) % 60],
    ['SEC', totalSeconds % 60],
  ] as const;
  const startOfDay = seoulTime
    ? startOfSeoulDay
    : (ms: number) => new Date(ms).setHours(0, 0, 0, 0);
  const dayDifference = Math.round(
    (startOfDay(clock.target) - startOfDay(clock.now)) / DAY_MS
  );

  return (
    <>
      {showCountdown && (
        <div className="w-full bg-transparent border-t border-[color:var(--calendar-divider,var(--color-border-divider))] py-6 px-6 flex flex-col items-center justify-center gap-4 text-center font-bold">
          {ended ? (
            <p className={summaryClassName}>종료된 일정이에요</p>
          ) : (
            <div className="flex w-full justify-between items-center text-center text-[color:var(--calendar-muted-text,#8e8e8e)]">
              {segments.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 items-center w-1/4"
                >
                  <span className="text-xs font-serif tracking-wider">
                    {label}
                  </span>
                  <span className="text-base font-serif">
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {hasText && (!ended || !isDefaultMessage) && (
        <PreviewBody
          html={messageHtml.replace(
            /\(D-Day\)/g,
            String(Math.max(0, dayDifference))
          )}
        />
      )}
    </>
  );
}
