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
    countdown: {
      viewComponent: jest.requireActual(
        '@/components/organisms/countdown/CountdownPreview'
      ).CountdownPreview,
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

const countdownBlock = {
  id: 'countdown-block',
  type: 'wedding',
  component: 'countdown',
  props: {
    title: '우리의 특별한 날',
    eventDateTime: '',
    onDayMessage: '오늘은 특별한 날입니다!',
    afterMessage: '함께해 주셔서 감사합니다.',
  },
} as NormalizedGuestPayload['blocks'][number];

async function renderCountdownAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={[countdownBlock]} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 카운트다운 공개 미리보기', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 빈 날짜 안내를 숨긴다',
    async pathname => {
      await renderCountdownAt(pathname);

      expect(
        screen.queryByText('행사 날짜를 입력하면 카운트다운이 표시됩니다.')
      ).not.toBeInTheDocument();
    }
  );

  it.each(['/dashboard', '/editor', '/invoice/yaKg'])(
    '비공개 경로 %s에서는 편집 안내를 보여준다',
    async pathname => {
      await renderCountdownAt(pathname);

      expect(
        screen.getByText('행사 날짜를 입력하면 카운트다운이 표시됩니다.')
      ).toBeInTheDocument();
    }
  );
});
