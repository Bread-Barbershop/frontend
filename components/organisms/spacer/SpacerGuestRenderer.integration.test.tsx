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
    spacer: {
      viewComponent: jest.requireActual(
        '@/components/organisms/spacer/SpacerPreview'
      ).SpacerPreview,
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

const spacerBlock = {
  id: 'spacer-block',
  type: 'wedding',
  component: 'spacer',
  props: { height: 48 },
} as NormalizedGuestPayload['blocks'][number];

async function renderSpacerAt(pathname: string) {
  mockPathname = pathname;

  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <GuestRenderer blocks={[spacerBlock]} bulkData={bulkData} />
    );
  });

  return result;
}

describe('GuestRenderer 여백 공개 미리보기', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    '공개 경로 %s에서는 여백 안내를 숨기고 높이를 유지한다',
    async pathname => {
      const { container } = await renderSpacerAt(pathname);

      expect(screen.queryByText('여백 · 48px')).not.toBeInTheDocument();
      expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle({
        height: '48px',
      });
    }
  );

  it.each(['/dashboard', '/editor', '/invoice/yaKg'])(
    '비공개 경로 %s에서는 편집용 여백 안내를 보여준다',
    async pathname => {
      await renderSpacerAt(pathname);

      const guide = screen.getByText('여백 · 48px');
      expect(guide).toHaveClass('border-dashed');
      expect(guide.parentElement).toHaveStyle({ height: '48px' });
    }
  );
});
