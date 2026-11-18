import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import GuestRenderer from './GuestRenderer';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

const mockCalendarView = jest.fn((props: Record<string, unknown>) =>
  React.createElement(
    'div',
    { 'data-testid': 'calendar-view' },
    props.className
  )
);
const mockPictureView = jest.fn((props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'picture-view' }, props.className)
);
const mockGuestbookView = jest.fn(() =>
  React.createElement('div', null, '축하 메시지 작성하기')
);
const mockSetTitleData = jest.fn();
const mockSetBodyData = jest.fn();
const mockPreloadFontFamilyWeights = jest.fn().mockResolvedValue(undefined);
const mockResolveGuestFontFamiliesToPreload = jest.fn(() => [] as string[]);

jest.mock('next/navigation', () => ({
  usePathname: () => '/guest/data-json-file-id',
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    calendar: {
      viewComponent: (props: Record<string, unknown>) =>
        mockCalendarView(props),
    },
    picture: {
      viewComponent: (props: Record<string, unknown>) => mockPictureView(props),
    },
    guestbook: { viewComponent: () => mockGuestbookView() },
  },
}));

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: (...args: unknown[]) =>
    mockPreloadFontFamilyWeights(...args),
}));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: (props: {
    children: React.ReactNode;
    animationType: string;
    triggerMode: string;
    animationDurationMs: number;
    animationEasing: string;
  }) =>
    React.createElement(
      'div',
      {
        className: 'scroll-fade-in-item',
        'data-testid': 'scroll-animation',
        'data-animation-type': props.animationType,
        'data-trigger-mode': props.triggerMode,
        'data-duration-ms': props.animationDurationMs,
        'data-easing': props.animationEasing,
      },
      props.children
    ),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: mockSetTitleData,
      setBodyData: mockSetBodyData,
    }),
}));

jest.mock('./guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: () =>
    mockResolveGuestFontFamiliesToPreload(),
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
  scrollAnimation: { animationType: 'fade-up', triggerMode: 'down-only', animationDurationMs: 700, animationEasing: 'natural' },
};

describe('GuestRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPreloadFontFamilyWeights.mockResolvedValue(undefined);
    mockResolveGuestFontFamiliesToPreload.mockReturnValue([]);
  });

  it('저장된 방명록 데이터는 삭제하지 않고 공개 화면에서 비활성화한다', () => {
    const blocks = [
      {
        id: 'saved-guestbook',
        type: 'wedding',
        component: 'guestbook',
        props: { formUrl: 'https://forms.gle/saved-form' },
      },
      { id: 'picture', type: 'wedding', component: 'picture', props: {} },
    ] as NormalizedGuestPayload['blocks'];
    const before = JSON.stringify(blocks);
    render(<GuestRenderer blocks={blocks} bulkData={bulkData} />);
    expect(mockGuestbookView).not.toHaveBeenCalled();
    expect(screen.queryByText('축하 메시지 작성하기')).not.toBeInTheDocument();
    expect(screen.getByTestId('picture-view')).toBeInTheDocument();
    expect(JSON.stringify(blocks)).toBe(before);
  });

  it('passes isGuestPage only to guest-aware preview components', async () => {
    const calendarBlock = {
      id: 'calendar-block',
      type: 'wedding',
      component: 'calendar',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];

    render(
      <GuestRenderer
        blocks={[calendarBlock, pictureBlock]}
        bulkData={bulkData}
      />
    );

    await waitFor(() => {
      expect(mockCalendarView).toHaveBeenCalled();
      expect(mockPictureView).toHaveBeenCalled();
    });

    expect(mockCalendarView.mock.calls[0][0]).toHaveProperty(
      'isGuestPage',
      true
    );
    expect(mockPictureView.mock.calls[0][0]).toHaveProperty(
      'isGuestPage',
      true
    );
  });

  it('폰트 로딩이 끝나지 않아도 초대장 본문을 표시한다', () => {
    mockResolveGuestFontFamiliesToPreload.mockReturnValue(['font-pending']);
    mockPreloadFontFamilyWeights.mockReturnValue(new Promise(() => undefined));

    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const { container } = render(
      <GuestRenderer blocks={[pictureBlock]} bulkData={bulkData} />
    );

    expect(screen.getByTestId('picture-view')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveStyle({ opacity: '0' });
  });

  it('블록별 legacy 설정을 무시하고 모든 블록에 공통 설정을 적용한다', () => {
    const sharedAnimation = {
      animationType: 'fade-down',
      triggerMode: 'up-only',
      animationDurationMs: 1300,
      animationEasing: 'soft',
    } as const;
    const block = {
      id: 'styled-picture',
      type: 'wedding',
      component: 'picture',
      props: {
        collectionStyle: 'showcase-11',
        animationType: 'none',
        triggerMode: 'both',
        animationDurationMs: 200,
      },
    } as NormalizedGuestPayload['blocks'][number];
    const newBlock = {
      id: 'new-picture',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    render(
      <GuestRenderer
        blocks={[block, newBlock]}
        bulkData={{ ...bulkData, scrollAnimation: sharedAnimation }}
      />
    );
    const chapter = screen.getAllByTestId('picture-view')[0].closest('section');
    expect(chapter).toHaveAttribute('data-design', 'showcase-11');
    expect(screen.getAllByTestId('picture-view')).toHaveLength(2);
    const wrappers = screen.getAllByTestId('scroll-animation');
    expect(wrappers).toHaveLength(2);
    wrappers.forEach(wrapper => {
      expect(wrapper).toHaveAttribute('data-animation-type', 'fade-down');
      expect(wrapper).toHaveAttribute('data-trigger-mode', 'up-only');
      expect(wrapper).toHaveAttribute('data-duration-ms', '1300');
      expect(wrapper).toHaveAttribute('data-easing', 'soft');
    });
  });

  it('폰트 로딩이 실패해도 초대장 본문을 표시한다', async () => {
    mockResolveGuestFontFamiliesToPreload.mockReturnValue(['font-failed']);
    mockPreloadFontFamilyWeights.mockRejectedValueOnce(
      new Error('font preload failed')
    );

    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const { container } = render(
      <GuestRenderer blocks={[pictureBlock]} bulkData={bulkData} />
    );

    expect(await screen.findByTestId('picture-view')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveStyle({ opacity: '0' });
  });
});
