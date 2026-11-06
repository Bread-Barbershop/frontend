import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

let mockPathname = '/guest/yaKg';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    timeline: {
      viewComponent: jest.requireActual(
        '@/components/organisms/timeline/TimelinePreview'
      ).TimelinePreview,
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
  useEditorStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
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

const timelineBlock = {
  id: 'timeline-block',
  type: 'wedding',
  component: 'timeline',
  props: { title: '행사 일정', items: [] },
} as NormalizedGuestPayload['blocks'][number];

async function renderTimelineAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={[timelineBlock]} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 일정 공개 미리보기', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 빈 일정 안내를 숨긴다',
    async pathname => {
      await renderTimelineAt(pathname);

      expect(screen.queryByText('식순을 추가해주세요.')).not.toBeInTheDocument();
    }
  );

  it.each(['/dashboard', '/editor', '/invoice/yaKg'])(
    '비공개 경로 %s에서는 편집 안내를 보여준다',
    async pathname => {
      await renderTimelineAt(pathname);

      expect(screen.getByText('식순을 추가해주세요.')).toBeInTheDocument();
    }
  );
});
