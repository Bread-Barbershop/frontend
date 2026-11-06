import { render, screen, waitFor } from '@testing-library/react';

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
  ScrollFadeIn: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: (state: Record<string, jest.Mock>) => unknown) =>
    selector({ setTitleData: jest.fn(), setBodyData: jest.fn() }),
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

  const result = render(
    <GuestRenderer blocks={[spacerBlock]} bulkData={bulkData} />
  );

  await waitFor(() =>
    expect(result.container.firstElementChild).toHaveStyle({ opacity: '1' })
  );

  return result;
}

describe('GuestRenderer spacer preview', () => {
  it.each(['/guest/yaKg', '/i/yaKg'])(
    'hides the spacer guide on the public route %s', async pathname => {
      await renderSpacerAt(pathname);

      expect(screen.queryByText('여백 · 48px')).not.toBeInTheDocument();
    }
  );

  it.each(['/dashboard', '/editor'])(
    'keeps the spacer guide visible on the editing route %s', async pathname => {
      await renderSpacerAt(pathname);

      expect(screen.getByText('여백 · 48px')).toBeInTheDocument();
    }
  );
});
