/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/ensureWorkspace', () => ({
  DriveHttpError: class DriveHttpError extends Error {
    status: number;
    details: unknown;

    constructor(message: string, status: number, details?: unknown) {
      super(message);
      this.name = 'DriveHttpError';
      this.status = status;
      this.details = details;
    }
  },
}));

jest.mock('@/app/api/drive/_lib/ensureInvitationMetaFile', () => ({
  loadInvitationMeta: jest.fn(),
  upsertInvitationMeta: jest.fn(),
}));

import { GET, POST } from '@/app/api/drive/shareUrl/route';
import {
  loadInvitationMeta,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';

const shareData = {
  title: '초대장',
  description: '초대합니다',
  imageFileId: 'image-file-id',
  showLocationButton: false,
  invitationUrl: '/guest/data-json-file-id',
};

describe('shareUrl route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('공유 데이터를 meta.json에 저장한다', async () => {
    (upsertInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: false,
        guestUrl: '/guest/data-json-file-id',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: shareData,
        updatedAt: '2026-06-10T10:00:00.000Z',
      },
    });

    const req = new Request('http://localhost/api/drive/shareUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitationFolderId: 'invitation-folder-id',
        dataJsonFileId: 'data-json-file-id',
        shareData,
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      metaFileId: 'meta-file-id',
      shareUrlFileId: 'meta-file-id',
      data: shareData,
    });
    expect(upsertInvitationMeta).toHaveBeenCalledWith('invitation-folder-id', {
      kakaoShare: shareData,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
  });

  it('meta.json의 공유 데이터를 조회한다', async () => {
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: false,
        guestUrl: '/guest/data-json-file-id',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: shareData,
        updatedAt: '2026-06-10T10:00:00.000Z',
      },
    });

    const req = new Request(
      'http://localhost/api/drive/shareUrl?invitationFolderId=invitation-folder-id'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      metaFileId: 'meta-file-id',
      shareUrlFileId: 'meta-file-id',
      data: shareData,
    });
    expect(loadInvitationMeta).toHaveBeenCalledWith('invitation-folder-id');
  });

  it('meta.json에 공유 데이터가 없으면 404를 반환한다', async () => {
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: false,
        guestUrl: null,
        dataJsonFileId: null,
        kakaoShare: null,
        updatedAt: '2026-06-10T10:00:00.000Z',
      },
    });

    const req = new Request(
      'http://localhost/api/drive/shareUrl?invitationFolderId=invitation-folder-id'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json).toEqual({
      ok: false,
      error: 'share data not found in meta.json',
    });
  });
});
