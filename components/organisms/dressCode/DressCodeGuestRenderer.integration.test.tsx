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
    dressCode: {
      viewComponent: jest.requireActual(
        '@/components/organisms/dressCode/DressCodeBlockPreview'
      ).DressCodeBlockPreview,
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

const dressCodeBlock = {
  id: 'dress-code-block',
  type: 'wedding',
  component: 'dressCode',
  props: { title: '드레스 코드', colors: [], guidelines: [] },
} as NormalizedGuestPayload['blocks'][number];

async function renderDressCodeAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={[dressCodeBlock]} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 드레스코드 공개 미리보기', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 빈 매너 안내를 숨긴다',
    async pathname => {
      await renderDressCodeAt(pathname);

      expect(
        screen.queryByText('매너 안내 문구를 추가해 주세요.')
      ).not.toBeInTheDocument();
    }
  );

  it.each(['/dashboard', '/editor', '/invoice/yaKg'])(
    '비공개 경로 %s에서는 편집 안내를 보여준다',
    async pathname => {
      await renderDressCodeAt(pathname);

      expect(
        screen.getByText('매너 안내 문구를 추가해 주세요.')
      ).toBeInTheDocument();
    }
  );
});
