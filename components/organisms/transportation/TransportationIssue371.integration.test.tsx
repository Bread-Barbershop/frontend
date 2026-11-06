import { render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import React from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    ScrollFadeIn: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => React.createElement('div', { className }, children),
  };
});

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: jest.fn(),
      setBodyData: jest.fn(),
      titleData: {
        font: 'font-lineseed',
        fontSize: '20px',
        fontWeight: '700',
        color: '#111111',
        isDefault: false,
      },
    }),
}));

jest.mock('@/app/guest/[id]/components/guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: jest.fn(() => []),
}));

const mockUsePathname = jest.mocked(usePathname);

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

const emptyTransportationBlock = {
  id: 'transportation-block',
  type: 'wedding',
  component: 'transportation',
  props: {},
} as NormalizedGuestPayload['blocks'][number];

describe('교통 안내 게스트 페이지 통합 렌더링', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['/guest/id', '/i/yaKg'])(
    '공개 경로 %s에서 빈 안내 문구를 숨긴다',
    async pathname => {
      mockUsePathname.mockReturnValue(pathname);

      render(
        <GuestRenderer
          blocks={[emptyTransportationBlock]}
          bulkData={bulkData}
        />
      );

      await waitFor(() => {
        expect(
          screen.queryByText('교통·주차 정보를 입력해 주세요.')
        ).not.toBeInTheDocument();
        expect(screen.getByText('오시는 길 안내')).toBeInTheDocument();
      });
    }
  );

  it('대시보드 미리보기에서는 빈 안내 문구를 유지한다', async () => {
    mockUsePathname.mockReturnValue('/dashboard/invitation/editor');

    render(
      <GuestRenderer blocks={[emptyTransportationBlock]} bulkData={bulkData} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('교통·주차 정보를 입력해 주세요.')
      ).toBeInTheDocument();
      expect(screen.getByText('오시는 길 안내')).toBeInTheDocument();
    });
  });
});
