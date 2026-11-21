import { act, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

let mockPathname = '/guest/test';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    calendar: {
      viewComponent: jest.requireActual(
        '@/components/organisms/calendar/CalendarPreview'
      ).CalendarPreview,
    },
  },
}));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      titleData: {
        font: 'font-lineseed',
        fontSize: '20px',
        fontWeight: '700',
        color: '#111111',
        isDefault: false,
      },
      bodyData: {
        font: 'font-pretendard',
        fontSize: '16px',
        fontWeight: '400',
        color: '#222222',
        isDefault: false,
      },
      setTitleData: jest.fn(),
      setBodyData: jest.fn(),
    }),
}));

jest.mock('@/app/guest/[id]/components/guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: jest.fn(() => []),
}));

const bulkData: NormalizedGuestPayload['bulkData'] = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-pretendard',
    fontSize: '16px',
    fontWeight: '400',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
  scrollAnimation: {
    animationType: 'fade-up',
    triggerMode: 'down-only',
    animationDurationMs: 700,
    animationEasing: 'natural',
  },
};

const calendarBlock = (date: string) =>
  ({
    id: 'calendar-block',
    type: 'wedding',
    component: 'calendar',
    props: {
      title: '예식 일시',
      subTitle: 'THE WEDDING CEREMONY',
      date,
      time: '오후 02:30',
      showStringDate: true,
      template: 'calendarType1',
      showCalendar: true,
      showDday: false,
      messageJson: null,
      messageHtml: null,
      isSubTitle: true,
    },
  }) satisfies NormalizedGuestPayload['blocks'][number];

function renderCalendarAt(pathname: string, date: string) {
  mockPathname = pathname;
  return render(
    <GuestRenderer blocks={[calendarBlock(date)]} bulkData={bulkData} />
  );
}

describe('GuestRenderer 달력 공개 미리보기', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['calendarType6', '영문 서명 월력', 'February'],
    ['calendarType7', '한지 책력', '이월'],
    ['calendarType9', '큰글씨 월력', '2월 29일'],
  ])(
    '%s로 저장한 윤년 월력과 안내 문구를 카운트다운 없이 표시한다',
    (template, name, heading) => {
      const block = calendarBlock('2028-02-29');
      render(
        <GuestRenderer
          blocks={[
            {
              ...block,
              props: {
                ...block.props,
                template,
                messageHtml: '<p>함께해 주세요</p>',
              },
            },
          ]}
          bulkData={bulkData}
        />
      );
      const card = within(screen.getByRole('article', { name }));
      expect(card.getByRole('heading', { name: heading })).toBeInTheDocument();
      expect(card.getByRole('cell', { name: '29 예식일' })).toHaveProperty(
        'cellIndex',
        2
      );
      expect(card.queryByRole('cell', { name: '30' })).not.toBeInTheDocument();
      expect(screen.getByText('함께해 주세요')).toBeInTheDocument();
      expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    }
  );

  it('주간 티켓은 해가 바뀌는 주의 7일을 표시하고 서울 자정에 디데이를 갱신한다', () => {
    jest.useFakeTimers({ now: new Date('2027-12-31T14:59:59Z') });
    const block = calendarBlock('2028-01-01');
    render(
      <GuestRenderer
        blocks={[
          {
            ...block,
            props: {
              ...block.props,
              template: 'calendarType8',
              time: '오전 12:00',
              showDday: true,
              messageHtml: '<p>새해에 만나요</p>',
            },
          },
        ]}
        bulkData={bulkData}
      />
    );
    act(() => jest.advanceTimersByTime(0));
    const card = within(screen.getByRole('article', { name: '주간 티켓' }));
    expect(card.getByText('12월 26일 – 1월 1일')).toBeInTheDocument();
    expect(card.getAllByRole('listitem')).toHaveLength(7);
    expect(card.getByText('AM')).toBeInTheDocument();
    expect(card.getByText('D−1')).toBeInTheDocument();
    expect(screen.getByText('DAYS')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1000));
    expect(card.getByText('D-Day')).toBeInTheDocument();
    expect(screen.getByText('종료된 일정이에요')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(86_400_000));
    expect(card.getByText('D+1')).toBeInTheDocument();
    expect(screen.getByText('새해에 만나요')).toBeInTheDocument();
  });

  it.each(['/guest/test', '/i/test'])(
    '공개 경로 %s에서 날짜가 비어 있으면 달력 입력 안내를 숨긴다',
    pathname => {
      renderCalendarAt(pathname, '');

      expect(
        screen.queryByText('날짜와 시간을 입력해 주세요')
      ).not.toBeInTheDocument();
    }
  );

  it.each(['/guest/test', '/i/test'])(
    '공개 경로 %s에서 날짜가 입력 중이면 달력 입력 안내를 숨긴다',
    pathname => {
      renderCalendarAt(pathname, '2026-03');

      expect(
        screen.queryByText('날짜와 시간을 입력해 주세요')
      ).not.toBeInTheDocument();
    }
  );

  it.each(['/guest/test', '/i/test'])(
    '공개 경로 %s에서 날짜가 있으면 달력을 표시한다',
    pathname => {
      renderCalendarAt(pathname, '2026-03-09');

      expect(screen.getByText('2026년 3월 9일')).toBeInTheDocument();
      expect(screen.getByText('THE WEDDING CEREMONY')).toBeInTheDocument();
    }
  );

  it('비공개 편집 경로에서는 날짜 입력 안내를 표시한다', () => {
    renderCalendarAt('/editor', '');

    expect(screen.getByText('날짜와 시간을 입력해 주세요')).toBeInTheDocument();
  });

  it('어두운 카드의 카운트다운에 맞는 색을 적용하고 작성자가 지정한 본문색을 유지한다', () => {
    jest.useFakeTimers({ now: new Date(2026, 2, 18) });
    mockPathname = '/guest/test';
    const block = calendarBlock('2026-03-19');
    render(
      <GuestRenderer
        blocks={[
          {
            ...block,
            props: {
              ...block.props,
              showDday: true,
              messageHtml:
                '<p><span style="color: #bc7780">초대 문구</span></p>',
            },
          },
        ]}
        bulkData={{
          ...bulkData,
          backgroundColor: '#536780',
          sectionStyle: 'rounded',
          bodyData: {
            ...bulkData.bodyData,
            color: '#E2E6ED',
            colorMode: 'automatic',
          },
        }}
      />
    );
    act(() => {
      jest.advanceTimersByTime(0);
    });

    const days = screen.getByText('DAYS');
    expect(days.closest('[data-invitation-dark]')).toBeInTheDocument();
    expect(days.closest('[data-section-style="rounded"]')).toBeInTheDocument();
    expect(days.parentElement?.parentElement?.className).toContain(
      '--calendar-muted-text'
    );
    expect(screen.getByText('초대 문구')).toHaveStyle({ color: '#bc7780' });
  });
});
