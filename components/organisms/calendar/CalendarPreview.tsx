'use client';

import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { EditorBlock } from '@/shared/types/block';
import { isDarkInvitationBackground } from '@/shared/utils/invitationBackgroundColor';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { getCalendarMessageHtml } from './calendarMessage';
import styles from './calendarPreview.module.css';
import { CalendarTemplates, DDayCountdown } from './components';
import { useCalendarData } from './hooks/useCalendarData';

import type { CSSProperties } from 'react';

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
  const { fontFamily, fontSize, color, isColorAutomatic } = useBodyFontInfo();
  const { mainStyle } = useTitleFontInfo();
  const automaticLightInk =
    isColorAutomatic && color && !isDarkInvitationBackground(color)
      ? color
      : undefined;

  if (isDateIncomplete && isGuestPage) return null;

  const TemplateComponent =
    CalendarTemplates[template as string] || CalendarTemplates['calendarType1'];

  return (
    <MiddlePreviewWrapper
      className={`${className} relative ${styles.preview}`}
      style={
        automaticLightInk
          ? ({
              '--calendar-automatic-body-color': automaticLightInk,
            } as CSSProperties)
          : undefined
      }
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
        <p className="text-sm text-[color:var(--calendar-muted-text,var(--color-gray-400))] font-normal">
          날짜와 시간을 입력해 주세요
        </p>
      ) : (
        <>
          {/* String Date Display */}
          {showStringDate && (
            <div
              className="flex flex-col items-center tracking-[-0.01rem] leading-[1.2] text-base font-normal text-[color:var(--calendar-text,var(--color-text-primary))] min-h-[40px] justify-center"
              style={{
                fontFamily,
                fontSize: `max(1rem, ${fontSize ?? '1rem'})`,
              }}
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
              messageHtml={getCalendarMessageHtml(blockInfo)}
            />
          )}
        </>
      )}
    </MiddlePreviewWrapper>
  );
}
