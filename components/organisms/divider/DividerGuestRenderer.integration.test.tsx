import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

let mockPathname = '/guest/yaKg';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    divider: {
      viewComponent: jest.requireActual(
        '@/components/organisms/divider/DividerBlockPreview'
      ).DividerBlockPreview,
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

const dividerBlock = {
  id: 'divider-block',
  type: 'wedding',
  component: 'divider',
  props: {
    height: 64,
    thickness: 1,
    color: '#E2E8F0',
    topSpacing: 12,
    bottomSpacing: 12,
  },
} as NormalizedGuestPayload['blocks'][number];

async function renderDividerAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={[dividerBlock]} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 구분선 공개 미리보기', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 점선 가이드를 숨기고 선과 여백을 유지한다',
    async pathname => {
      const { container } = await renderDividerAt(pathname);
      const preview = container.querySelector('[aria-hidden="true"]');

      expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
      expect(preview).toHaveStyle({
        paddingTop: '12px',
        paddingBottom: '12px',
      });
      expect(preview?.firstElementChild).toHaveStyle({
        height: '64px',
        width: '1px',
      });
    }
  );

  it.each(['/dashboard', '/editor', '/invoice/yaKg'])(
    '비공개 경로 %s에서는 점선 편집 가이드를 보여준다',
    async pathname => {
      const { container } = await renderDividerAt(pathname);

      expect(container.querySelector('.border-dashed')).toBeInTheDocument();
    }
  );
});
