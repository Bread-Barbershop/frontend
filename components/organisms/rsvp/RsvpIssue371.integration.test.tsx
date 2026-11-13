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

const emptyRsvpBlock = {
  id: 'rsvp-block',
  type: 'wedding',
  component: 'rsvp',
  props: {},
} as NormalizedGuestPayload['blocks'][number];

describe('RSVP 게스트 페이지 통합 렌더링', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['/guest/id', '/i/yaKg'])(
    '공개 경로 %s에서 빈 응답 안내를 숨긴다',
    async pathname => {
      mockUsePathname.mockReturnValue(pathname);

      render(<GuestRenderer blocks={[emptyRsvpBlock]} bulkData={bulkData} />);

      await waitFor(() => {
        expect(
          screen.queryByText(
            '구글 설문 응답 링크를 등록하면 버튼이 표시됩니다.'
          )
        ).not.toBeInTheDocument();
        expect(screen.getByText('참석 여부 안내')).toBeInTheDocument();
      });
    }
  );

  it('대시보드 미리보기에서는 빈 응답 안내를 유지한다', async () => {
    mockUsePathname.mockReturnValue('/dashboard/invitation/editor');

    render(<GuestRenderer blocks={[emptyRsvpBlock]} bulkData={bulkData} />);

    await waitFor(() => {
      expect(
        screen.getByText('구글 설문 응답 링크를 등록하면 버튼이 표시됩니다.')
      ).toBeInTheDocument();
      expect(screen.getByText('참석 여부 안내')).toBeInTheDocument();
    });
  });
});
