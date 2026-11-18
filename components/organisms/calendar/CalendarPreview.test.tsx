import { act, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { CalendarPreview } from './CalendarPreview';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('./components', () => ({
  ...jest.requireActual<typeof import('./components')>('./components'),
  DDayCountdown: () => (
    <div data-testid="dday-countdown-preview">Countdown</div>
  ),
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
  isGuestPage = false,
  dark = false
) => {
  const preview = (
    <CalendarPreview
      blockInfo={blockInfo}
      className=""
      language="ko"
      isGuestPage={isGuestPage}
      onClick={() => {}}
    />
  );
  return render(dark ? <div data-invitation-dark>{preview}</div> : preview);
};

describe('CalendarPreview', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('편집 화면에서 날짜가 비어 있으면 입력 안내만 보여준다', () => {
    renderPreview(block);

    expect(screen.getByText('날짜와 시간을 입력해 주세요')).toBeInTheDocument();
    expect(screen.queryByText('날짜 입력 중...')).not.toBeInTheDocument();
    expect(screen.queryByText('일', { exact: true })).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('dday-countdown-preview')
    ).not.toBeInTheDocument();
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
    expect(screen.getByText('일', { exact: true })).toBeInTheDocument();
    expect(screen.getByTestId('dday-countdown-preview')).toBeInTheDocument();
  });
});

describe('어두운 배경의 달력 본문', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it.each([
    'calendarType1',
    'calendarType2',
    'calendarType3',
    'calendarType4',
    'calendarType5',
  ])('%s에서 일반 날짜와 날짜 안내에 달력 글자색을 사용한다', template => {
    act(() => useEditorStore.getState().selectBackgroundColor('#536780'));
    const { container } = renderPreview(
      { ...block, props: { ...block.props, date: '2026-03-19', template } },
      false,
      true
    );

    const dateSummary = screen.getByText('2026년 3월 19일').parentElement;
    expect(dateSummary?.className).toContain('--calendar-text');
    const regularDate = screen.getByText('18');
    const regularDateStyle =
      template === 'calendarType3' || template === 'calendarType4'
        ? regularDate.parentElement
        : regularDate.parentElement?.parentElement;
    expect(regularDateStyle?.className).toContain('--calendar-text');
    const calendar = container.querySelector<HTMLElement>(
      '[style*="--calendar-automatic-body-color"]'
    );
    expect(
      calendar?.style.getPropertyValue('--calendar-automatic-body-color')
    ).toBe('#E2E6ED');
  });

  it('대비 경계에 가까운 회색에서 흰색 보조 글자색을 사용하고 사용자 지정 본문색은 보존한다', () => {
    act(() => useEditorStore.getState().selectBackgroundColor('#757575'));
    const { container } = renderPreview(
      { ...block, props: { ...block.props, date: '2026-03-19' } },
      false,
      true
    );
    const calendar = container.querySelector<HTMLElement>(
      '[style*="--calendar-automatic-body-color"]'
    );
    expect(
      calendar?.style.getPropertyValue('--calendar-automatic-body-color')
    ).toBe('#FFFFFF');
    expect(screen.getByText('월').className).toContain('--calendar-muted-text');
    const adjacentDate = screen.getAllByText('1')[1];
    expect(adjacentDate.parentElement?.parentElement?.className).toContain(
      '--calendar-outside-month-opacity'
    );

    act(() => {
      const editor = useEditorStore.getState();
      editor.setBodyData({
        ...editor.bodyData,
        color: '#d49398',
        colorMode: 'custom',
      });
    });
    expect(
      calendar?.style.getPropertyValue('--calendar-automatic-body-color')
    ).toBe('');
    expect(useEditorStore.getState().bodyData.color).toBe('#d49398');
  });
});

describe.each([
  { surface: '편집 미리보기', isGuestPage: false },
  { surface: '하객 화면', isGuestPage: true },
])('$surface 달력의 선택일 강조', ({ isGuestPage }) => {
  beforeEach(() => useEditorStore.getState().reset());

  it.each(['calendarType1', 'calendarType2', 'calendarType3'])(
    '%s에서 강조색을 유지하고 밝기에 맞는 글자색으로 바꾼다',
    template => {
      const setTitleColor = (color: string) =>
        act(() =>
          useEditorStore.setState(state => ({
            titleData: { ...state.titleData, color },
          }))
        );
      setTitleColor('#FFFAF2');
      renderPreview(
        { ...block, props: { ...block.props, date: '2026-03-19', template } },
        isGuestPage
      );

      const selectedDay = screen.getByText('19').parentElement;
      expect(selectedDay).toHaveStyle({
        backgroundColor: '#FFFAF2',
        color: '#000000',
      });
      if (template === 'calendarType3') {
        for (const label of ['02:30', '오후']) {
          const time = screen.getByText(label);
          expect(time.closest('[style]')).toBe(selectedDay);
          expect(time).not.toHaveClass('text-white');
        }
      }

      setTitleColor('#536780');

      expect(selectedDay).toHaveStyle({
        backgroundColor: '#536780',
        color: '#FFFFFF',
      });
    }
  );
});
