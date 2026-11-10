import { render, screen } from '@testing-library/react';

import { CalendarPreview } from './CalendarPreview';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('./components', () => ({
  CalendarTemplates: {
    calendarType1: () => <div data-testid="calendar-preview">Calendar</div>,
  },
  DDayCountdown: () => <div data-testid="dday-countdown-preview">Countdown</div>,
}));

const block: EditorBlock<'calendar'> = {
  id: 'calendar-1',
  component: 'calendar',
  type: 'wedding',
  props: {
    title: '예식 일시',
    subTitle: 'THE WEDDING CEREMONY',
    date: '',
    time: '오후 02:30',
    showStringDate: true,
    template: 'calendarType1',
    showCalendar: true,
    showDday: true,
    messageJson: null,
    messageHtml: null,
    isSubTitle: true,
  },
};

const renderPreview = (
  blockInfo: EditorBlock<'calendar'>,
  isGuestPage = false
) =>
  render(
    <CalendarPreview
      blockInfo={blockInfo}
      className=""
      language="ko"
      isGuestPage={isGuestPage}
      onClick={() => {}}
    />
  );

describe('CalendarPreview', () => {
  it('편집 화면에서 날짜가 비어 있으면 입력 안내만 보여준다', () => {
    renderPreview(block);

    expect(screen.getByText('날짜와 시간을 입력해 주세요')).toBeInTheDocument();
    expect(screen.queryByText('날짜 입력 중...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-preview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dday-countdown-preview')).not.toBeInTheDocument();
    expect(screen.queryByText('예식 일시')).not.toBeInTheDocument();
  });

  it('게스트 화면에서 날짜가 비어 있으면 블록을 숨긴다', () => {
    const { container } = renderPreview(block, true);

    expect(container).toBeEmptyDOMElement();
  });

  it('날짜가 입력되면 기존 날짜·달력·카운트다운을 보여준다', () => {
    renderPreview({
      ...block,
      props: { ...block.props, date: '2026-03-09' },
    });

    expect(screen.getByText('2026년 3월 9일')).toBeInTheDocument();
    expect(screen.getByText('월요일 오후 2시 30분')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-preview')).toBeInTheDocument();
    expect(screen.getByTestId('dday-countdown-preview')).toBeInTheDocument();
  });
});
