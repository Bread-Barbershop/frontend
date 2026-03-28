'use client';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { CalendarTemplates, DDayCountdown } from './components';
import { useCalendarData } from './hooks/useCalendarData';

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
    timeInfo,
    monthText,
    targetLabel,
    timeLabel,
  } = useCalendarData({ date, time, language, template });

  const isDateIncomplete = !date || date.length < 10;

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
        <div className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-semibold text-text-primary min-h-[40px] justify-center">
          {isDateIncomplete ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner className="w-5 h-5 animate-spin text-gray-300" />
              <span className="text-sm text-gray-400 font-normal">
                날짜 입력 중...
              </span>
            </div>
          ) : (
            <>
              <p>{stringDateFormatted}</p>
              <p>{formattedTime}</p>
            </>
          )}
        </div>
      )}

      {showCalendar && (
        <TemplateComponent
          currentYear={currentYear}
          currentMonth={currentMonth}
          calendarDays={calendarDays}
          headerDays={headerDays}
          time={time}
          timeInfo={timeInfo}
          language={language}
          monthText={monthText}
          targetLabel={targetLabel}
          timeLabel={timeLabel}
        />
      )}

      {/* D-Day Countdown Display */}
      {showDday && <DDayCountdown date={date} time={time} />}
    </div>
  );
}
