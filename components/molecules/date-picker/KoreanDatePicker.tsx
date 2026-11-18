'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';
import {
  getTodayKstDateString,
  parseStrictDate,
  type StrictDateParts,
} from '@/shared/utils/dateValidation';

import type {
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEvent,
} from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorId?: string;
  input: {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onBlur: FocusEventHandler<HTMLInputElement>;
  };
}

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const focusClassName =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const navigationClassName =
  'grid size-9 place-items-center rounded-md text-text-primary hover:bg-neutral-100 disabled:opacity-30';

function toUtcDate({ year, month, day }: StrictDateParts) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

function toDateParts(date: Date): StrictDateParts {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function dateValue({ year, month, day }: StrictDateParts) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate({ year, month, day }: StrictDateParts) {
  return `${year}년 ${month}월 ${day}일`;
}

function moveByMonths(parts: StrictDateParts, amount: number) {
  const date = toUtcDate({ ...parts, day: 1 });
  date.setUTCMonth(date.getUTCMonth() + amount + 1, 0);
  date.setUTCDate(Math.min(parts.day, date.getUTCDate()));
  return toDateParts(date);
}

function getGridMove(
  event: KeyboardEvent<HTMLTableElement>,
  parts: StrictDateParts
) {
  const date = toUtcDate(parts);
  const weekday = date.getUTCDay();
  const dayOffsets: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowUp: -7,
    ArrowDown: 7,
    Home: -weekday,
    End: 6 - weekday,
  };
  if (Object.hasOwn(dayOffsets, event.key)) {
    date.setUTCDate(parts.day + dayOffsets[event.key]);
    return toDateParts(date);
  }
  const monthStep = event.shiftKey ? 12 : 1;
  if (event.key === 'PageUp') return moveByMonths(parts, -monthStep);
  if (event.key === 'PageDown') return moveByMonths(parts, monthStep);
}

export function KoreanDatePicker({
  label,
  value,
  onChange,
  errorId,
  input,
}: Props) {
  const inputId = useId();
  const panelId = useId();
  const headingId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const activeDay = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const [activeDate, setActiveDate] = useState<StrictDateParts | null>(null);
  const [today, setToday] = useState('');
  const selectedDate = parseStrictDate(value);

  useEffect(() => {
    if (!activeDate || !moveFocus.current) return;
    moveFocus.current = false;
    activeDay.current?.focus();
  }, [activeDate]);

  function open() {
    const date = getTodayKstDateString();
    setToday(date);
    moveFocus.current = true;
    setActiveDate(selectedDate ?? parseStrictDate(date));
  }

  function close() {
    setActiveDate(null);
    trigger.current?.focus();
  }

  function choose(nextValue: string) {
    onChange(nextValue);
    close();
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (!activeDate) return;
    const nextDate = getGridMove(event, activeDate);
    if (!nextDate) return;
    event.preventDefault();
    if (nextDate.year < 1 || nextDate.year > 9999) return;
    moveFocus.current = true;
    setActiveDate(nextDate);
  }

  const monthStart = activeDate && toUtcDate({ ...activeDate, day: 1 });
  const firstWeekday = monthStart?.getUTCDay() ?? 0;
  const monthEnd =
    activeDate &&
    toUtcDate({ ...activeDate, month: activeDate.month + 1, day: 0 });
  const daysInMonth = monthEnd?.getUTCDate() ?? 0;
  const weekCount = Math.ceil((firstWeekday + daysInMonth) / weekdays.length);

  return (
    <div
      className="grid gap-1"
      lang="ko"
      onBlur={event => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setActiveDate(null);
        }
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && activeDate) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <label htmlFor={inputId} className="text-sm">
        {label}
      </label>
      <div className="flex min-h-10 items-stretch rounded-md border border-border-divider bg-white transition-colors focus-within:border-primary hover:border-primary">
        <input
          {...input}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder="예: 2028-02-29"
          aria-describedby={errorId}
          aria-invalid={Boolean(errorId)}
          className="min-w-0 flex-1 rounded-l-md px-3 text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
        <button
          ref={trigger}
          type="button"
          aria-label={`${label} 달력`}
          aria-expanded={Boolean(activeDate)}
          aria-controls={activeDate ? panelId : undefined}
          onClick={() => (activeDate ? close() : open())}
          className={cn(
            'grid w-10 shrink-0 place-items-center rounded-r-md text-text-secondary hover:bg-neutral-100 hover:text-text-primary',
            activeDate && 'bg-primary/10 text-primary',
            focusClassName
          )}
        >
          <CalendarDays size={17} aria-hidden />
        </button>
      </div>
      {activeDate && (
        <div
          id={panelId}
          className="mt-1 grid gap-2 rounded-xl border border-border-divider bg-white p-2 shadow-edit sm:p-3"
        >
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="이전 달"
              disabled={activeDate.year === 1 && activeDate.month === 1}
              className={cn(navigationClassName, focusClassName)}
              onClick={() => setActiveDate(moveByMonths(activeDate, -1))}
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <span
              id={headingId}
              aria-live="polite"
              className="text-center text-sm font-semibold"
            >
              {activeDate.year}년 {activeDate.month}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              disabled={activeDate.year === 9999 && activeDate.month === 12}
              className={cn(navigationClassName, focusClassName)}
              onClick={() => setActiveDate(moveByMonths(activeDate, 1))}
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
          <table
            role="grid"
            aria-labelledby={headingId}
            className="w-full table-fixed"
            onKeyDown={handleGridKeyDown}
          >
            <thead>
              <tr>
                {weekdays.map(weekday => (
                  <th
                    key={weekday}
                    scope="col"
                    abbr={`${weekday}요일`}
                    className="h-7 text-center text-xs font-medium text-text-secondary"
                  >
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: weekCount }, (_, week) => (
                <tr key={week}>
                  {weekdays.map((weekday, column) => {
                    const day =
                      week * weekdays.length + column - firstWeekday + 1;
                    if (day < 1 || day > daysInMonth)
                      return <td key={weekday} />;
                    const parts = { ...activeDate, day };
                    const dayValue = dateValue(parts);
                    const selected = dayValue === value;
                    const current = dayValue === today;
                    const focused = day === activeDate.day;
                    return (
                      <td
                        key={weekday}
                        aria-selected={selected}
                        className="p-0.5 text-center"
                      >
                        <button
                          ref={focused ? activeDay : null}
                          type="button"
                          aria-label={formatDate(parts)}
                          aria-current={current ? 'date' : undefined}
                          tabIndex={focused ? 0 : -1}
                          onClick={() => choose(dayValue)}
                          className={cn(
                            'h-9 w-full rounded-md text-sm tabular-nums',
                            selected
                              ? 'bg-primary font-semibold text-white'
                              : 'hover:bg-neutral-100',
                            current &&
                              !selected &&
                              'font-semibold text-primary ring-1 ring-inset ring-primary',
                            focusClassName
                          )}
                        >
                          {day}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between gap-2 border-t border-border-divider pt-2 text-xs">
            <button
              type="button"
              disabled={!selectedDate}
              onClick={() => choose('')}
              className={cn(
                'min-h-9 rounded-md px-2 text-text-secondary hover:bg-neutral-100 disabled:opacity-40',
                focusClassName
              )}
            >
              날짜 지우기
            </button>
            <button
              type="button"
              onClick={() => choose(today)}
              className={cn(
                'min-h-9 rounded-md px-2 font-semibold text-primary hover:bg-neutral-100',
                focusClassName
              )}
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
