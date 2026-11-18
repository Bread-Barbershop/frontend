'use client';

import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { KOR_DAYS } from '@/components/organisms/calendar/constants/calendar';
import {
  createCalendarDate,
  generateCalendarGrid,
  getFormattedStringDate,
} from '@/components/organisms/calendar/utils/utils';
import { cn } from '@/shared/utils/cn';
import {
  getTodayKstDateString,
  parseStrictDate,
} from '@/shared/utils/dateValidation';

const dayOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const monthButtonClass =
  'grid size-8 place-items-center rounded-md hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40';

function formatDate(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftMonth(date: Date, months: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = createCalendarDate(year, month + 1, 0).getDate();
  return createCalendarDate(year, month, Math.min(date.getDate(), lastDay));
}

function isSupportedDate(date: Date) {
  return date.getFullYear() >= 1 && date.getFullYear() <= 9999;
}

export function PrivacyEndDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const triggerId = useId();
  const valueId = useId();
  const panelId = useId();
  const monthId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const activeDayRef = useRef<HTMLButtonElement>(null);
  const focusDay = useRef(false);
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const today = getTodayKstDateString();
  const chosen = parseStrictDate(value);
  const year = activeDate?.getFullYear();
  const month = activeDate?.getMonth();
  const days =
    year !== undefined && month !== undefined
      ? generateCalendarGrid(year, month, 0)
      : [];

  useLayoutEffect(() => {
    if (activeDate && focusDay.current) {
      activeDayRef.current?.focus();
      focusDay.current = false;
    }
  }, [activeDate]);

  function closePicker() {
    setActiveDate(null);
    triggerRef.current?.focus();
  }

  function selectDate(date: string) {
    onChange(date);
    closePicker();
  }

  function moveToDate(date: Date, moveFocus: boolean) {
    if (!isSupportedDate(date)) return;
    focusDay.current = moveFocus;
    setActiveDate(date);
  }

  function handleDayKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    date: Date
  ) {
    let nextDate: Date;
    switch (event.key) {
      case 'PageUp':
      case 'PageDown':
        nextDate = shiftMonth(date, event.key === 'PageUp' ? -1 : 1);
        break;
      default: {
        const offset = dayOffsets[event.key];
        if (offset === undefined) return;
        nextDate = createCalendarDate(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + offset
        );
      }
    }

    event.preventDefault();
    moveToDate(nextDate, true);
  }

  return (
    <div
      className="flex flex-col gap-1 text-sm"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActiveDate(null);
        }
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && activeDate) {
          event.preventDefault();
          event.stopPropagation();
          closePicker();
        }
      }}
    >
      <label htmlFor={triggerId}>일정이 끝나는 날</label>
      <button
        id={triggerId}
        ref={triggerRef}
        type="button"
        aria-describedby={valueId}
        aria-expanded={activeDate !== null}
        aria-controls={activeDate ? panelId : undefined}
        onClick={() => {
          if (activeDate) {
            closePicker();
            return;
          }
          const startingDay = chosen ?? parseStrictDate(today);
          if (startingDay) {
            const { year, month, day } = startingDay;
            moveToDate(createCalendarDate(year, month - 1, day), true);
          }
        }}
        className="flex h-10 w-full items-center justify-between rounded-md border border-border-divider px-3 text-sm focus:outline-none focus:border-primary"
      >
        <span id={valueId} className={cn(!chosen && 'text-text-secondary')}>
          {chosen
            ? getFormattedStringDate(chosen.year, chosen.month, chosen.day)
            : '날짜 선택'}
        </span>
        <CalendarDays size={16} aria-hidden="true" />
      </button>
      {activeDate && year !== undefined && month !== undefined && (
        <div
          id={panelId}
          className="rounded-lg border border-border-divider bg-white p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              className={monthButtonClass}
              disabled={year === 1 && month === 0}
              onClick={() => moveToDate(shiftMonth(activeDate, -1), false)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span id={monthId} className="font-semibold" aria-live="polite">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              aria-label="다음 달"
              className={monthButtonClass}
              disabled={year === 9999 && month === 11}
              onClick={() => moveToDate(shiftMonth(activeDate, 1), false)}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div role="grid" aria-labelledby={monthId} className="space-y-0.5">
            <div role="row" className="grid grid-cols-7 text-center">
              {KOR_DAYS.map((day, index) => (
                <span
                  key={day}
                  role="columnheader"
                  aria-label={`${day}요일`}
                  className={cn(
                    'py-1 text-xs font-semibold text-text-secondary',
                    index === 0 && 'text-primary'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
            {Array.from({ length: days.length / 7 }, (_, index) => (
              <div key={index} role="row" className="grid grid-cols-7">
                {days.slice(index * 7, index * 7 + 7).map(day => {
                  const date = day.originalDate;
                  const dateValue = formatDate(date);
                  const selected = dateValue === value;
                  const isToday = dateValue === today;
                  const isActive = date.getTime() === activeDate.getTime();
                  return (
                    <div
                      key={dateValue}
                      role="gridcell"
                      aria-selected={selected}
                      className="flex justify-center"
                    >
                      <button
                        type="button"
                        ref={isActive ? activeDayRef : undefined}
                        aria-label={getFormattedStringDate(
                          date.getFullYear(),
                          date.getMonth() + 1,
                          date.getDate()
                        )}
                        aria-current={isToday ? 'date' : undefined}
                        tabIndex={isActive ? 0 : -1}
                        disabled={!isSupportedDate(date)}
                        className={cn(
                          'size-8 rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
                          selected
                            ? 'bg-primary font-semibold text-white'
                            : 'hover:bg-neutral-100',
                          !selected &&
                            !day.isCurrentMonth &&
                            'text-text-tertiary',
                          !selected &&
                            isToday &&
                            'ring-1 ring-inset ring-primary'
                        )}
                        onClick={() => selectDate(dateValue)}
                        onKeyDown={event => handleDayKeyDown(event, date)}
                      >
                        {day.num}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-border-divider pt-2">
            <button
              type="button"
              className="rounded-md px-2 py-1.5 text-xs font-semibold text-primary hover:bg-neutral-100"
              onClick={() => selectDate(today)}
            >
              오늘
            </button>
            <button
              type="button"
              className="rounded-md px-2 py-1.5 text-xs text-text-secondary hover:bg-neutral-100 disabled:opacity-40"
              disabled={!chosen}
              onClick={() => selectDate('')}
            >
              날짜 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
