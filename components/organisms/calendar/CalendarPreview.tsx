'use client';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { CalendarTemplates, DDayCountdown } from './components';
import { useCalendarData } from './useCalendarData';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  className: string;
  language: 'ko' | 'en';
  titleClassName?: string;
  onClick: () => void;
}

export function CalendarPreview({
  blockInfo,
  className,
  language,
  titleClassName,
  ...rest
}: Props) {
  const { date, time, showStringDate, template, showCalendar, showDday } =
    blockInfo.props;

  const {
    currentYear,
    currentMonth,
    calendarDays,
    stringDateFormatted,
    formattedTime,
    headerDays,
    monthOffset,
    setMonthOffset,
  } = useCalendarData({ date, time, language });

  const TemplateComponent =
    CalendarTemplates[template as string] || CalendarTemplates['calendarType1'];

  return (
    <div
      className={cn(
        'w-full py-8 px-5 flex flex-col items-center gap-6 isolate',
        className
      )}
      {...rest}
    >
      {/* Title */}
      <PreviewTitle
        enTitle="THE WEDDING CEREMONY"
        koTitle="예식 일시"
        titleClassName={titleClassName}
      />

      {/* String Date Display */}
      {showStringDate && (
        <div className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-semibold text-text-primary">
          <p>{stringDateFormatted}</p>
          <p>{formattedTime}</p>
        </div>
      )}

      {showCalendar && (
        <TemplateComponent
          currentYear={currentYear}
          currentMonth={currentMonth}
          calendarDays={calendarDays}
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          headerDays={headerDays}
          time={time}
          language={language}
        />
      )}

      {/* D-Day Countdown Display */}
      {showDday && <DDayCountdown date={date} time={time} />}
    </div>
  );
}
