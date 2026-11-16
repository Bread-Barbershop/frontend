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

  it('저장된 템플릿 스타일과 선택한 블록 애니메이션을 함께 복원한다', () => {
    const block = {
      id: 'styled-picture',
      type: 'wedding',
      component: 'picture',
      props: {
        collectionStyle: 'showcase-11',
        animationType: 'none',
        triggerMode: 'both',
      },
    } as NormalizedGuestPayload['blocks'][number];
    const { container } = render(
      <GuestRenderer blocks={[block]} bulkData={bulkData} />
    );
    const chapter = screen.getByTestId('picture-view').closest('section');
    expect(chapter).toHaveAttribute('data-design', 'showcase-11');
    expect(chapter?.closest('.scroll-fade-in-item')).toHaveClass('opacity-100');
    expect(
      container.querySelectorAll('[data-testid="picture-view"]')
    ).toHaveLength(1);
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
