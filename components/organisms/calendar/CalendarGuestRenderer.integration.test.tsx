import { render, screen } from '@testing-library/react';
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
  }) as NormalizedGuestPayload['blocks'][number];

function renderCalendarAt(pathname: string, date: string) {
  mockPathname = pathname;
  return render(
    <GuestRenderer blocks={[calendarBlock(date)]} bulkData={bulkData} />
  );
}

describe('GuestRenderer 달력 공개 미리보기', () => {
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

    expect(
      screen.getByText('날짜와 시간을 입력해 주세요')
    ).toBeInTheDocument();
  });
});
