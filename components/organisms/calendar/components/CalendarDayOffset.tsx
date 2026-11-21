import { useSyncExternalStore } from 'react';

import {
  DAY_MS,
  parseSeoulDateTimeToTimestamp,
  startOfSeoulDay,
} from '@/shared/utils/dateValidation';

function subscribeToMidnight(notify: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  function schedule() {
    const now = Date.now();
    timer = setTimeout(
      () => {
        notify();
        schedule();
      },
      startOfSeoulDay(now) + DAY_MS - now
    );
  }
  schedule();
  return () => clearTimeout(timer);
}

const getToday = () => startOfSeoulDay(Date.now());
const getServerDay = () => null;

export function CalendarDayOffset({
  date,
  eventName,
  language,
  expanded = false,
}: {
  date: string;
  eventName: string;
  language: 'ko' | 'en';
  expanded?: boolean;
}) {
  const today = useSyncExternalStore(
    subscribeToMidnight,
    getToday,
    getServerDay
  );
  const target = parseSeoulDateTimeToTimestamp(`${date}T00:00`);
  if (today === null || target === null) return null;
  const days = (target - today) / DAY_MS;
  if (!expanded)
    return (
      <span>
        {days === 0 ? 'D-Day' : `D${days > 0 ? '−' : '+'}${Math.abs(days)}`}
      </span>
    );
  if (language === 'en') {
    if (days === 0) return <span>{eventName} day is today</span>;
    return (
      <span>
        {Math.abs(days)} {Math.abs(days) === 1 ? 'day' : 'days'}{' '}
        {days > 0 ? 'until' : 'since'} the {eventName.toLowerCase()}
      </span>
    );
  }
  return (
    <span>
      {days === 0
        ? `오늘이 ${eventName}일입니다`
        : days > 0
          ? `${eventName}까지 ${days}일`
          : `${eventName} 후 ${-days}일`}
    </span>
  );
}
