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

    expect(mockCalendarView.mock.calls[0][0]).not.toHaveProperty('isGuestPage');
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
