/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import {
  ensureThumbnailFile,
  THUMBNAIL_NAME_PNG,
  THUMBNAIL_NAME_WEBP,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

describe('ensureThumbnailFile', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('invitationFolderId가 누락되면 400 에러를 던진다', async () => {
    await expect(ensureThumbnailFile('')).rejects.toThrow(
      'invitationFolderId is required'
    );
  });

  it('기존 썸네일(WebP 또는 PNG)이 존재하면 재사용한다', async () => {
    (googleFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        files: [{ id: 'thumbnail-file-id' }],
      }),
    });

    const result = await ensureThumbnailFile('test-folder-id');

    expect(result).toEqual({
      thumbnailFileId: 'thumbnail-file-id',
      reused: true,
    });

    const calledUrl = (googleFetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain(THUMBNAIL_NAME_WEBP);
    expect(calledUrl).toContain(THUMBNAIL_NAME_PNG);
  });

  it('기존 썸네일이 없으면 null을 반환한다', async () => {
    (googleFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        files: [],
      }),
    });

    const result = await ensureThumbnailFile('test-folder-id');

    expect(result).toEqual({
      thumbnailFileId: null,
      reused: false,
    });
  });
});
