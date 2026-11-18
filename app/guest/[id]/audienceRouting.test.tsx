/**
 * @jest-environment node
 */

import { renderToStaticMarkup } from 'react-dom/server';

import ShortGuestPage, {
  generateMetadata as shortMetadata,
} from '@/app/i/[code]/page';

import { familyInvitation, rootInvitation } from './fixtures/audienceRoute';
import GuestPage, { generateMetadata as guestMetadata } from './page';

const mockLoadGuestPayload = jest.fn();
const mockResolveAudienceLink = jest.fn();
const mockResolveShortCode = jest.fn();
const mockIsShortUrlStoreConfigured = jest.fn();

jest.mock('@/app/api/drive/_lib/audienceLinkStore', () => ({
  resolveAudienceLink: (...args: unknown[]) => mockResolveAudienceLink(...args),
}));

jest.mock('@/app/api/short-url/_lib/shortUrlStore', () => ({
  isShortUrlStoreConfigured: () => mockIsShortUrlStoreConfigured(),
  resolveShortCode: (code: string) => mockResolveShortCode(code),
}));

jest.mock('@/app/guest/[id]/server/loadGuestPayload', () => ({
  loadGuestPayload: (id: string) => mockLoadGuestPayload(id),
}));

jest.mock('@/app/guest/[id]/components/GuestInvitationView', () => ({
  __esModule: true,
  default: ({ payload }: { payload: unknown }) => (
    <div data-testid="guest-invitation">{JSON.stringify(payload)}</div>
  ),
}));

type SearchParams = { to?: string | string[] };

const rawArgs = (searchParams: SearchParams) => ({
  params: Promise.resolve({ id: 'root-data' }),
  searchParams: Promise.resolve(searchParams),
});
const shortArgs = (searchParams: SearchParams) => ({
  params: Promise.resolve({ code: 'g4k2' }),
  searchParams: Promise.resolve(searchParams),
});

const routes = [
  {
    path: '/guest/root-data',
    page: (searchParams: SearchParams) => GuestPage(rawArgs(searchParams)),
    metadata: (searchParams: SearchParams) =>
      guestMetadata(rawArgs(searchParams)),
  },
  {
    path: '/i/g4k2',
    page: (searchParams: SearchParams) =>
      ShortGuestPage(shortArgs(searchParams)),
    metadata: (searchParams: SearchParams) =>
      shortMetadata(shortArgs(searchParams)),
  },
];

describe.each(routes)(
  '하객별 초대장 링크 $path',
  ({ page, metadata, path }) => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockIsShortUrlStoreConfigured.mockReturnValue(true);
      mockResolveShortCode.mockResolvedValue('root-data');
      mockResolveAudienceLink.mockResolvedValue('family-data');
      mockLoadGuestPayload.mockImplementation((id: string) => {
        if (id === 'root-data') return Promise.resolve(rootInvitation);
        if (id === 'family-data') return Promise.resolve(familyInvitation);
        throw new Error(`Unexpected invitation: ${id}`);
      });
    });

    it('선택한 초대장만 본문과 공유 메타데이터에 담는다', async () => {
      const html = renderToStaticMarkup(await page({ to: 'family' }));
      const share = await metadata({ to: 'family' });

      expect(mockLoadGuestPayload.mock.calls).toEqual([
        ['root-data'],
        ['family-data'],
        ['root-data'],
        ['family-data'],
      ]);
      expect(mockResolveAudienceLink).toHaveBeenCalledWith(
        'root-data',
        'family'
      );
      expect(html).toContain('family-poster');
      expect(html).not.toContain('root-poster');
      expect(share.openGraph).toMatchObject({
        title: '가족 초대장',
        images: 'https://lh3.googleusercontent.com/d/family-poster',
      });
      expect(share.twitter).toMatchObject({ title: '가족 초대장' });
    });

    it('하객 구분이 없는 원래 링크는 기존 초대장을 보여 준다', async () => {
      const html = renderToStaticMarkup(await page({}));

      expect(html).toContain('root-poster');
      expect(mockResolveAudienceLink).not.toHaveBeenCalled();
    });

    it.each([
      [''],
      ['Family'],
      [' family '],
      ['base'],
      [['family', 'friends']],
    ])('잘못된 하객 구분 %j를 기본 초대장으로 보내지 않는다', async to => {
      const html = renderToStaticMarkup(await page({ to }));

      expect(html).toContain('초대장 링크를 확인해 주세요');
      expect(html).not.toContain('root-poster');
      expect(await metadata({ to })).not.toHaveProperty('openGraph');
      expect(mockLoadGuestPayload).not.toHaveBeenCalled();
      expect(mockResolveAudienceLink).not.toHaveBeenCalled();
    });

    it('등록되지 않은 하객 구분은 초대장 정보 없이 링크 안내를 보여 준다', async () => {
      mockResolveAudienceLink.mockResolvedValue(null);

      const html = renderToStaticMarkup(await page({ to: 'unknown' }));

      expect(html).toContain('초대장 링크를 확인해 주세요');
      expect(html).not.toContain('root-poster');
      expect(await metadata({ to: 'unknown' })).not.toHaveProperty('openGraph');
      expect(mockLoadGuestPayload.mock.calls).toEqual([
        ['root-data'],
        ['root-data'],
      ]);
    });

    it('기본 초대장이 비공개면 하객별 초대장을 조회하지 않는다', async () => {
      mockLoadGuestPayload.mockResolvedValueOnce({ status: 'private' });
      mockLoadGuestPayload.mockResolvedValueOnce({ status: 'private' });

      const html = renderToStaticMarkup(await page({ to: 'family' }));

      expect(html).toContain('비공개 초대장이에요');
      expect(html).not.toContain('family-poster');
      expect(await metadata({ to: 'family' })).not.toHaveProperty('openGraph');
      expect(mockResolveAudienceLink).not.toHaveBeenCalled();
    });

    it('선택한 초대장이 비공개면 기본 초대장 정보도 보여 주지 않는다', async () => {
      mockLoadGuestPayload.mockImplementation((id: string) =>
        Promise.resolve(
          id === 'root-data' ? rootInvitation : { status: 'private' }
        )
      );

      const html = renderToStaticMarkup(await page({ to: 'family' }));

      expect(html).toContain('비공개 초대장이에요');
      expect(html).not.toContain('root-poster');
      expect(await metadata({ to: 'family' })).not.toHaveProperty('openGraph');
    });

    it('하객별 링크 저장소가 일시 중단되면 하객 구분을 유지해 재시도한다', async () => {
      mockResolveAudienceLink.mockRejectedValue(new Error('Redis unavailable'));

      const html = renderToStaticMarkup(await page({ to: 'family' }));

      expect(html).toContain(`href="${path}?to=family"`);
      expect(html).not.toContain('root-poster');
      expect(await metadata({ to: 'family' })).not.toHaveProperty('openGraph');
    });
  }
);

it('짧은 링크 저장소가 중단되어도 하객 구분을 유지해 재시도한다', async () => {
  mockResolveShortCode.mockRejectedValue(new Error('Redis unavailable'));

  const html = renderToStaticMarkup(
    await ShortGuestPage(shortArgs({ to: 'family' }))
  );

  expect(html).toContain('href="/i/g4k2?to=family"');
});
