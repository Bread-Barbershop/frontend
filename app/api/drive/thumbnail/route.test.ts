/**
 * @jest-environment node
 */

import { createHash } from 'node:crypto';
import { syncNewBaseFiles } from '@/app/api/drive/_lib/audienceVisibility';

jest.mock('@/app/api/drive/_lib/audienceVisibility', () => ({
  syncNewBaseFiles: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/captureDriveError', () => ({
  captureDriveError: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureThumbnailFile', () => {
  const actual = jest.requireActual('@/app/api/drive/_lib/ensureThumbnailFile');
  return {
    ...actual,
    ensureThumbnailFile: jest.fn(),
  };
});

import {
  ensureThumbnailFile,
  THUMBNAIL_NAME_PNG,
  THUMBNAIL_NAME_WEBP,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { GET, POST } from '@/app/api/drive/thumbnail/route';

describe('/api/drive/thumbnail route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST: 썸네일 업로드 및 정규화', () => {
    it('기존 클라이언트가 같은 이미지를 다시 전송하면 Drive 파일 생성과 삭제를 건너뛴다', async () => {
      const png =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      jest.mocked(ensureThumbnailFile).mockResolvedValue({
        thumbnailFileId: 'saved-cover',
        reused: true,
        sha256Checksum: createHash('sha256')
          .update(Buffer.from(png, 'base64'))
          .digest('hex'),
      });
      const response = await POST(
        new Request('http://localhost/api/drive/thumbnail', {
          method: 'POST',
          body: JSON.stringify({
            invitationFolderId: 'folder-123',
            thumbnailData: { dataUrl: `data:image/png;base64,${png}` },
          }),
        })
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        thumbnailFileId: 'saved-cover',
      });
      expect(googleFetch).not.toHaveBeenCalled();
    });

    it('WebP dataUrl을 전달하면 name, mimeType, PATCH Content-Type이 모두 image/webp 및 THUMBNAIL_NAME_WEBP로 정규화된다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: null,
        reused: false,
      });

      // 1) POST metadata response
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'new-webp-file-id' }),
      });
      // 2) PATCH file body response
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const req = new Request('http://localhost/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: 'folder-123',
          thumbnailData: {
            name: 'arbitrary-name.png', // 이름이 png여도 dataUrl이 webp이면 webp로 정규화
            mimeType: 'image/png',
            dataUrl:
              'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v24A',
            width: 860,
            height: 1200,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.thumbnailFileId).toBe('new-webp-file-id');

      // 메타데이터 생성 검증 (WebP로 정규화)
      const metaCall = (googleFetch as jest.Mock).mock.calls[0];
      const metaBody = JSON.parse(metaCall[1].body);
      expect(metaBody.name).toBe(THUMBNAIL_NAME_WEBP);
      expect(metaBody.mimeType).toBe('image/webp');

      // 업로드 Content-Type 검증 (WebP로 정규화)
      const patchCall = (googleFetch as jest.Mock).mock.calls[1];
      expect(patchCall[1].headers['Content-Type']).toBe('image/webp');
    });

    it('PNG fallback dataUrl을 전달하면 name, mimeType, PATCH Content-Type이 모두 image/png 및 THUMBNAIL_NAME_PNG로 정규화된다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: null,
        reused: false,
      });

      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'new-png-file-id' }),
      });
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const req = new Request('http://localhost/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: 'folder-123',
          thumbnailData: {
            name: 'some.webp', // 이름이 webp여도 dataUrl이 png이면 png로 정규화
            dataUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            width: 860,
            height: 1200,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.thumbnailFileId).toBe('new-png-file-id');

      const metaCall = (googleFetch as jest.Mock).mock.calls[0];
      const metaBody = JSON.parse(metaCall[1].body);
      expect(metaBody.name).toBe(THUMBNAIL_NAME_PNG);
      expect(metaBody.mimeType).toBe('image/png');

      const patchCall = (googleFetch as jest.Mock).mock.calls[1];
      expect(patchCall[1].headers['Content-Type']).toBe('image/png');
    });

    it('기존 파일이 존재할 경우 새 파일 생성 완료 후 기존 파일을 DELETE 한다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: 'old-thumbnail-id',
        reused: true,
      });

      // 1) POST metadata
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'new-thumbnail-id' }),
      });
      // 2) PATCH file body
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
      // 3) DELETE old file
      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const req = new Request('http://localhost/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: 'folder-123',
          thumbnailData: {
            dataUrl:
              'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v24A',
            width: 860,
            height: 1200,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.thumbnailFileId).toBe('new-thumbnail-id');

      // 3번째 호출이 DELETE old-thumbnail-id 여야 함
      expect(googleFetch as jest.Mock).toHaveBeenCalledTimes(3);
      const deleteCall = (googleFetch as jest.Mock).mock.calls[2];
      expect(deleteCall[0]).toContain('old-thumbnail-id');
      expect(deleteCall[1].method).toBe('DELETE');
    });
  });

  describe('데이터 포맷 검증 및 오류 복구', () => {
    it('새 썸네일 공개 권한 적용이 실패하면 새 파일만 정리하고 이전 링크를 보존한다', async () => {
      jest
        .mocked(ensureThumbnailFile)
        .mockResolvedValue({ thumbnailFileId: 'old', reused: true });
      jest
        .mocked(googleFetch)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'new' }),
        } as Response);
      jest
        .mocked(syncNewBaseFiles)
        .mockRejectedValueOnce(new Error('permission update failed'));
      const response = await POST(
        new Request('http://localhost/api/drive/thumbnail', {
          method: 'POST',
          body: JSON.stringify({
            invitationFolderId: 'root',
            thumbnailData: {
              dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
            },
          }),
        })
      );
      expect(response.status).toBe(500);
      expect(googleFetch).toHaveBeenCalledWith(
        expect.stringMatching(/files\/new$/),
        { method: 'DELETE' }
      );
      expect(googleFetch).not.toHaveBeenCalledWith(
        expect.stringMatching(/files\/old$/),
        { method: 'DELETE' }
      );
    });
    it('data URL과 실제 이미지 서명이 불일치하면 400을 반환하고 업로드하지 않는다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: null,
        reused: false,
      });

      const req = new Request('http://localhost/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: 'folder-123',
          thumbnailData: {
            name: THUMBNAIL_NAME_WEBP,
            mimeType: 'image/webp',
            dataUrl: 'data:image/webp;base64,aGVsbG8=',
          },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(googleFetch).not.toHaveBeenCalled();
    });

    it('새 파일 저장 뒤 이전 파일 삭제가 실패해도 새 썸네일 ID를 반환한다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: 'old-png-file-id',
        reused: true,
      });
      (googleFetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: 'new-webp-file-id' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ message: 'temporarily unavailable' }),
        });

      const req = new Request('http://localhost/api/drive/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationFolderId: 'folder-123',
          thumbnailData: {
            name: THUMBNAIL_NAME_WEBP,
            mimeType: 'image/webp',
            dataUrl:
              'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoB+AA/v24A',
          },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({
        ok: true,
        thumbnailFileId: 'new-webp-file-id',
      });
      expect(googleFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('GET: 썸네일 조회', () => {
    it('해당 폴더의 파일 ID와 체크섬만 조회하면 이미지 본문을 내려받지 않는다', async () => {
      jest.mocked(ensureThumbnailFile).mockResolvedValue({
        thumbnailFileId: 'family-cover',
        sha256Checksum: 'saved-checksum',
        reused: true,
      });
      const res = await GET(
        new Request(
          'http://localhost/api/drive/thumbnail?invitationFolderId=family&metadata=1'
        )
      );
      expect(ensureThumbnailFile).toHaveBeenCalledWith('family');
      await expect(res.json()).resolves.toEqual({
        ok: true,
        thumbnailFileId: 'family-cover',
        sha256Checksum: 'saved-checksum',
      });
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(googleFetch).not.toHaveBeenCalled();
    });

    it('invitationFolderId로 조회 시 썸네일 파일 ID와 데이터를 반환한다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: 'existing-thumb-id',
        reused: true,
      });

      (googleFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ thumbnailData: 'test-data' }),
      });

      const req = new Request(
        'http://localhost/api/drive/thumbnail?invitationFolderId=folder-123'
      );
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.ok).toBe(true);
      expect(json.thumbnailFileId).toBe('existing-thumb-id');
    });

    it('썸네일 파일이 없으면 404를 반환한다', async () => {
      (ensureThumbnailFile as jest.Mock).mockResolvedValue({
        thumbnailFileId: null,
        reused: false,
      });

      const req = new Request(
        'http://localhost/api/drive/thumbnail?invitationFolderId=folder-123'
      );
      const res = await GET(req);
      expect(res.status).toBe(404);
    });
  });
});
