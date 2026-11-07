import { parseSeoulDateTimeToTimestamp } from '@/shared/utils/dateValidation';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CountdownStatus = 'unset' | 'before' | 'today' | 'after';
export type CountdownTime = {
  status: CountdownStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function parseSeoulDateTime(input: string): number | null {
  return parseSeoulDateTimeToTimestamp(input);
}

export function getCountdownTime(input: string, now: number): CountdownTime {
  const timestamp = parseSeoulDateTime(input);
  const empty = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (timestamp === null || !Number.isFinite(now)) return { status: 'unset', ...empty };
  const eventDayStart = Math.floor((timestamp + KST_OFFSET_MS) / DAY_MS) * DAY_MS - KST_OFFSET_MS;
  if (now >= eventDayStart + DAY_MS) return { status: 'after', ...empty };
  if (now >= eventDayStart) return { status: 'today', ...empty };

  const secondsLeft = Math.max(0, Math.ceil((timestamp - now) / 1000));
  return {
    status: 'before',
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor((secondsLeft % 86400) / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  };
}
