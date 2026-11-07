'use client';

import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { CalendarTemplates, DDayCountdown } from './components';
import { useCalendarData } from './hooks/useCalendarData';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  className: string;
  language: 'ko' | 'en';
  titleClassName?: string;
  isGuestPage?: boolean;
  onClick: () => void;
}

export function CalendarPreview({
  blockInfo,
  className,
  language,
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const {
    title,
    subTitle,
    date,
    time,
    showStringDate,
    template,
    showCalendar,
    showDday,
    isSubTitle,
  } = blockInfo.props;
  const defaultTitle = blockInfo.type === 'wedding' ? '예식 일시' : '행사일시';
  const defaultSubTitle =
    blockInfo.type === 'wedding' ? 'THE WEDDING CEREMONY' : 'Date & Time';

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
  } = useCalendarData({ date, time, language, template, type: blockInfo.type });

  const isDateIncomplete = !date || date.length < 10;
  const { fontFamily } = useBodyFontInfo();
  const { mainStyle } = useTitleFontInfo();

  if (isDateIncomplete && isGuestPage) return null;

  const TemplateComponent =
    CalendarTemplates[template as string] || CalendarTemplates['calendarType1'];

  return (
    <MiddlePreviewWrapper
      className={`${className} relative`}
      titleClassName={titleClassName}
      noTitle={isDateIncomplete}
      checkedSubTitle={isSubTitle}
      subTitle={subTitle}
      subTitleDefault={defaultSubTitle}
      mainTitle={title}
      mainTitleDefault={defaultTitle}
      childClassName="gap-6"
      {...rest}
    >
      {isDateIncomplete ? (
        <p className="text-sm text-gray-400 font-normal">
          날짜와 시간을 입력해 주세요
        </p>
      ) : (
        <>
          {/* String Date Display */}
          {showStringDate && (
            <div
              className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-normal text-text-primary min-h-[40px] justify-center"
              style={{ fontFamily }}
            >
              <p>{stringDateFormatted}</p>
              <p>{formattedTime}</p>
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
              accentColor={mainStyle.color}
            />
          )}

          {/* D-Day Countdown Display */}
          {showDday && (
            <DDayCountdown
              date={date}
              time={time}
              messageJson={
                blockInfo.props.messageHtml ??
                tiptapJsonToHtmlUniversal(blockInfo.props.messageJson)
              }
            />
          )}
        </>
      )}
    </MiddlePreviewWrapper>
  );
}
