import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { CalendarTemplates } from './components';
import { useCalendarData } from './useCalendarData';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  className: string;
  titleClassName: string;
  language: 'ko' | 'en';
  onClick: () => void;
}

export function CalendarPreview({
  blockInfo,
  className,
  titleClassName,
  language,
  ...rest
}: Props) {
  const { date, time, showStringDate, template } = blockInfo.props;

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
        'w-full py-8 px-5 flex flex-col items-center gap-6',
        className
      )}
      {...rest}
    >
      {/* Title */}
      <div className="flex flex-col items-center">
        <p
          className={cn(
            'font-semibold tracking-[0.08rem] text-[#F28B82]',
            titleClassName
          )}
        >
          THE WEDDING CEREMONY
        </p>
        <p className="text-2xl mt-1 text-[#F28B82]">예식 일시</p>
      </div>

      {/* String Date Display */}
      {showStringDate && (
        <div className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-semibold text-text-primary">
          <p>{stringDateFormatted}</p>
          <p>{formattedTime}</p>
        </div>
      )}

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
    </div>
  );
}
