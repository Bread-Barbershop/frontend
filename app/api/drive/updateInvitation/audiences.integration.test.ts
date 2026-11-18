/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/captureDriveError', () => ({
  captureDriveError: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { GET } from './route';

const request = new Request(
  'https://invia.test/api/drive/updateInvitation?id=invitation-root'
);
const mimeType = 'application/vnd.google-apps.folder';
const legacyData = {
  id: 'legacy-data',
  name: 'data.json',
  mimeType: 'application/json',
};

describe('하객 그룹이 있는 초대장의 편집 데이터 API', () => {
  beforeEach(() => jest.resetAllMocks());

  it('하위 하객 그룹을 편집 이미지 폴더로 읽지 않고 이미지 페이지를 끝까지 조회한다', async () => {
    jest.mocked(googleFetch).mockImplementation(async input => {
      const url = new URL(input);
      const q = url.searchParams.get('q') ?? '';
      if (url.pathname.endsWith('/legacy-data')) {
        return Response.json({
          blocks: [],
          bgm: { selectedBgmId: null },
          mainPoster: 'legacy',
        });
      }
      if (q.startsWith("'invitation-root' in parents")) {
        return Response.json({
          files: [
            { id: 'image-folder', name: 'images', mimeType },
            {
              id: 'audience-folder',
              name: 'Family Images',
              mimeType,
              appProperties: { kind: 'invitation_audience' },
            },
            legacyData,
          ],
        });
      }
      if (q.startsWith("'image-folder' in parents")) {
        const page = url.searchParams.get('pageToken');
        return Response.json({
          files: [
            {
              id: page ? 'image-2' : 'image-1',
              name: 'photo.webp',
              mimeType: 'image/webp',
            },
          ],
          ...(page ? {} : { nextPageToken: 'next' }),
        });
      }
      throw new Error(`Unexpected Drive request: ${input}`);
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      imageFolderId: 'image-folder',
      images: { files: [{ id: 'image-1' }, { id: 'image-2' }] },
      config: { mainPoster: 'legacy' },
    });
    expect(
      jest
        .mocked(googleFetch)
        .mock.calls.every(([url]) => !url.includes('audience-folder'))
    ).toBe(true);
  });

  it('data.json 다운로드에 실패하면 빈 데이터로 편집을 시작하지 않는다', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      jest
        .mocked(googleFetch)
        .mockResolvedValueOnce(Response.json({ files: [legacyData] }))
        .mockResolvedValueOnce(Response.json({}, { status: 503 }));
      const response = await GET(request);

      expect(response.ok).toBe(false);
      expect(await response.json()).toMatchObject({ success: false });
    } finally {
      log.mockRestore();
    }
  });
});
