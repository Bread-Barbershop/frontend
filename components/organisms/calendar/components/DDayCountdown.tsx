import { useEffect, useMemo, useState } from 'react';

import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { parseStrictDate } from '@/shared/utils/dateValidation';

interface Props {
  date: string;
  messageHtml: string;
  showCountdown: boolean;
  isDefaultMessage: boolean;
  time?: string;
}

const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 24 * 60 * 60;
const summaryClassName =
  'text-[color:var(--calendar-muted-text,#8e8e8e)] text-sm tracking-tight w-full text-center';

function getTargetDate(date: string, time?: string) {
  const parts = parseStrictDate(date);
  if (!parts) return null;

  const target = new Date(0);
  target.setFullYear(parts.year, parts.month - 1, parts.day);
  target.setHours(12, 0, 0, 0);

  const match = time
    ?.trim()
    .match(
      /^(?:(오전|오후|am|pm)\s*)?(\d{1,2}):(\d{2})(?:\s*(오전|오후|am|pm))?$/i
    );
  if (!match) return target;

  const [, prefix, rawHour, rawMinute, suffix] = match;
  const period = (prefix || suffix)?.toLowerCase();
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  const validHour = period ? hour >= 1 && hour <= 12 : hour <= 23;
  if (validHour && minute <= 59 && !(prefix && suffix)) {
    const isPM = period === '오후' || period === 'pm';
    target.setHours(period ? (hour % 12) + (isPM ? 12 : 0) : hour, minute);
  }

  return target;
}

export function DDayCountdown({
  date,
  time,
  messageHtml,
  showCountdown,
  isDefaultMessage,
}: Props) {
  const targetDate = useMemo(() => getTargetDate(date, time), [date, time]);
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
          : new Date(now).setHours(24, 0, 0, 0) - now;
        timer = setTimeout(tick, Math.min(nextUpdate, remaining));
      }
    };

    // Read the client clock after hydration so the initial markup stays stable.
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, [targetTime, needsClock, showCountdown]);

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
  const dayDifference = Math.round(
    (new Date(targetDate).setHours(0, 0, 0, 0) -
      new Date(clock.now).setHours(0, 0, 0, 0)) /
      (SECONDS_PER_DAY * MS_PER_SECOND)
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
