import {
  calendarCardNames,
  type CalendarCardType,
} from '@/shared/data/template/componentTemplate';

import { MONTH_NAMES_EN } from '../constants/calendar';
import { getFormattedTimeStr, parseCalendarClock } from '../utils/utils';

import styles from './calendarCard.module.css';
import { CalendarDayOffset } from './CalendarDayOffset';

import type { CalendarDayInfo } from '../types/calendar';

const koreanMonths = [
  '일월',
  '이월',
  '삼월',
  '사월',
  '오월',
  '유월',
  '칠월',
  '팔월',
  '구월',
  '시월',
  '십일월',
  '십이월',
];
const pad = (n: number) => String(n).padStart(2, '0');

interface Props {
  template: CalendarCardType;
  calendarDays: CalendarDayInfo[];
  headerDays: string[];
  date: string;
  time?: string;
  language: 'ko' | 'en';
  isWedding: boolean;
  showStringDate: boolean;
  showDday: boolean;
}

function MonthGrid({
  days,
  headings,
  label,
  selectedLabel,
}: {
  days: CalendarDayInfo[];
  headings: string[];
  label: string;
  selectedLabel: string;
}) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    if (week.some(day => day.isCurrentMonth)) weeks.push(week);
  }
  return (
    <table className={styles.monthGrid} aria-label={label}>
      <thead>
        <tr>
          {headings.map(day => (
            <th key={day} scope="col">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map(week => (
          <tr key={week[0].originalDate.getTime()}>
            {week.map(day => (
              <td key={day.num}>
                {day.isCurrentMonth && (
                  <span
                    className={day.isTargetDate ? styles.selected : undefined}
                  >
                    {day.num}
                    {day.isTargetDate && (
                      <span className="sr-only"> {selectedLabel}</span>
                    )}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CalendarCard({
  template,
  calendarDays,
  headerDays,
  date,
  time,
  language,
  isWedding,
  showStringDate,
  showDday,
}: Props) {
  const selected = calendarDays.find(day => day.isTargetDate);
  if (!selected) return null;
  const target = selected.originalDate;
  const year = target.getFullYear();
  const month = target.getMonth() + 1;
  const day = selected.num;
  const englishMonth = MONTH_NAMES_EN[month - 1];
  const weekday = target.toLocaleDateString('en-US', { weekday: 'long' });
  const clock = parseCalendarClock(time);
  const digits = clock && `${clock.hour % 12 || 12}:${pad(clock.minute)}`;
  const period = clock && (clock.hour < 12 ? 'AM' : 'PM');
  const englishTime = digits ? `${digits} ${period}` : '';
  const koreanDateTime = getFormattedTimeStr(
    target.getDay(),
    clock ? `${clock.hour}:${pad(clock.minute)}` : undefined
  );
  const isKorean = language === 'ko';
  const event = isWedding ? 'Wedding' : 'Event';
  const eventName = isKorean ? (isWedding ? '예식' : '행사') : event;
  const dayName = isKorean ? `${eventName}일` : `${event} day`;
  const monthLabel = isKorean
    ? `${year}년 ${month}월`
    : `${englishMonth} ${year}`;
  const when = isKorean
    ? koreanDateTime
    : [weekday, englishTime].filter(Boolean).join(' · ');
  const grid = (
    <MonthGrid
      days={calendarDays}
      headings={headerDays}
      label={monthLabel}
      selectedLabel={dayName}
    />
  );
  const offset = showDday && (
    <CalendarDayOffset
      date={date}
      eventName={eventName}
      language={language}
      expanded={template === 'calendarType9'}
    />
  );
  let content;
  switch (template) {
    case 'calendarType6':
      content = (
        <>
          <header className={styles.rule}>
            <span lang="en">{event.toUpperCase()} DAY</span>
            <span>{isKorean ? '일정' : 'Schedule'}</span>
          </header>
          {showStringDate && (
            <div className={styles.dateLines}>
              {isKorean && (
                <p>
                  {year} · {month} · {day} · {koreanDateTime}
                </p>
              )}
              <p lang="en">
                {weekday}, {englishMonth} {day}, {year}
                {digits && ` · ${englishTime}`}
              </p>
            </div>
          )}
          <h3 className={styles.signature} lang="en">
            {englishMonth}
          </h3>
          {grid}
          {showDday && (
            <footer>
              {offset}
              <span aria-hidden="true"> ♥</span>
            </footer>
          )}
        </>
      );
      break;
    case 'calendarType7': {
      const seal = isWedding ? '혼례' : '행사';
      content = (
        <>
          <header className={styles.bookHeader}>
            <span>{isKorean ? `${seal} 일시` : `${event} date`}</span>
            <span>{year}</span>
          </header>
          <div className={styles.bookTitle}>
            <h3>{isKorean ? koreanMonths[month - 1] : englishMonth}</h3>
            <span className={styles.seal} aria-hidden="true">
              {seal}
            </span>
          </div>
          {grid}
          {(showStringDate || showDday) && (
            <footer>
              {showStringDate && (
                <span>
                  {isKorean
                    ? `${day}일 ${when}`
                    : `${englishMonth} ${day} · ${when}`}
                </span>
              )}
              {offset}
            </footer>
          )}
        </>
      );
      break;
    }
    case 'calendarType8': {
      const rangeDate = (d: Date) =>
        isKorean
          ? `${d.getMonth() + 1}월 ${d.getDate()}일`
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      content = (
        <>
          <header className={styles.ticketHeader}>
            <span lang="en">{event} invitation</span>
            <span>{year}</span>
          </header>
          {showStringDate && (
            <div className={styles.ticketTop}>
              <h3>
                {pad(month)} / {pad(day)}
                <small lang="en">{weekday}</small>
              </h3>
              {clock && (
                <div className={styles.stub}>
                  <small>{period}</small>
                  <strong>{digits}</strong>
                  <span>{isKorean ? `${eventName} 시작` : 'Start time'}</span>
                </div>
              )}
            </div>
          )}
          <ol className={styles.week} aria-label={monthLabel}>
            {calendarDays.map(({ num, originalDate, isTargetDate }, i) => (
              <li
                key={originalDate.getTime()}
                className={isTargetDate ? styles.selected : undefined}
              >
                <small>{headerDays[i]}</small>
                <span>{num}</span>
                {isTargetDate && <span className="sr-only">{dayName}</span>}
              </li>
            ))}
          </ol>
          <footer>
            <span>
              {rangeDate(calendarDays[0].originalDate)} –{' '}
              {rangeDate(calendarDays[6].originalDate)}
            </span>
            {offset}
          </footer>
        </>
      );
      break;
    }
    case 'calendarType9':
      content = (
        <>
          <header className={styles.largeHeader}>
            <small>
              {year} {eventName}
            </small>
            <h3>
              {showStringDate
                ? isKorean
                  ? `${month}월 ${day}일`
                  : `${englishMonth} ${day}`
                : isKorean
                  ? `${month}월`
                  : englishMonth}
            </h3>
            {showStringDate && <p>{when}</p>}
          </header>
          {grid}
          {showDday && <footer>{offset}</footer>}
        </>
      );
      break;
  }
  return (
    <article
      className={`${styles.card} ${styles[template]}`}
      aria-label={calendarCardNames[template]}
    >
      {content}
    </article>
  );
}
