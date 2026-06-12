import { render, waitFor } from '@testing-library/react';
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
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: mockSetTitleData,
      setBodyData: mockSetBodyData,
    }),
}));

jest.mock('./guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: jest.fn(() => []),
}));

const bulkData: NormalizedGuestPayload['bulkData'] = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    isDefault: false,
  },
  bodyData: {
    font: 'font-pretendard',
    fontSize: '16px',
    fontWeight: '400',
    color: '#222222',
    bold: false,
    italic: false,
    underline: false,
    align: 'center',
    isDefault: false,
  },
  isZoom: false,
};

describe('GuestRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
