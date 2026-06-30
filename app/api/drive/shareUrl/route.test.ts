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

jest.mock('@/app/api/short-url/_lib/shortUrlStore', () => ({
  getOrCreateShortCode: jest.fn(),
}));

import { GET, POST } from '@/app/api/drive/shareUrl/route';
import {
  loadInvitationMeta,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { getOrCreateShortCode } from '@/app/api/short-url/_lib/shortUrlStore';

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
    (getOrCreateShortCode as jest.Mock).mockResolvedValue({
      shortCode: 'aB7kQ2x',
      guestPath: '/i/aB7kQ2x',
    });
  });

  it('공유 데이터를 meta.json에 저장한다', async () => {
    const shortShareData = {
      ...shareData,
      invitationUrl: 'http://localhost/i/aB7kQ2x',
    };

    (upsertInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: false,
        guestUrl: 'http://localhost/i/aB7kQ2x',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: shortShareData,
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
      data: shortShareData,
      guestUrl: 'http://localhost/i/aB7kQ2x',
      dataJsonFileId: 'data-json-file-id',
      shortCode: 'aB7kQ2x',
    });
    expect(getOrCreateShortCode).toHaveBeenCalledWith(
      'invitation-folder-id',
      'data-json-file-id'
    );
    expect(upsertInvitationMeta).toHaveBeenCalledWith('invitation-folder-id', {
      kakaoShare: shortShareData,
      guestUrl: 'http://localhost/i/aB7kQ2x',
      dataJsonFileId: 'data-json-file-id',
    });
  });

  it('짧은 URL 생성이 비활성화되면 기존 긴 URL로 저장한다', async () => {
    (getOrCreateShortCode as jest.Mock).mockResolvedValue(null);
    (upsertInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: false,
        guestUrl: 'http://localhost/guest/data-json-file-id',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: {
          ...shareData,
          invitationUrl: 'http://localhost/guest/data-json-file-id',
        },
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
      data: {
        ...shareData,
        invitationUrl: 'http://localhost/guest/data-json-file-id',
      },
      guestUrl: 'http://localhost/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
      shortCode: null,
    });
    expect(upsertInvitationMeta).toHaveBeenCalledWith('invitation-folder-id', {
      kakaoShare: {
        ...shareData,
        invitationUrl: 'http://localhost/guest/data-json-file-id',
      },
      guestUrl: 'http://localhost/guest/data-json-file-id',
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
      data: {
        ...shareData,
        invitationUrl: 'http://localhost/guest/data-json-file-id',
      },
      guestUrl: 'http://localhost/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
    expect(loadInvitationMeta).toHaveBeenCalledWith('invitation-folder-id');
  });

  it('조회 시 kakaoShare URL이 루트 도메인이면 meta guestUrl로 보정한다', async () => {
    const rootShareData = {
      ...shareData,
      invitationUrl: 'https://invia.co.kr',
    };
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: true,
        guestUrl: '/i/aB7k',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: rootShareData,
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
      data: {
        ...rootShareData,
        invitationUrl: 'http://localhost/i/aB7k',
      },
      guestUrl: 'http://localhost/i/aB7k',
      dataJsonFileId: 'data-json-file-id',
    });
  });

  it('조회 시 저장된 URL이 모두 루트면 dataJsonFileId로 긴 guest URL을 복구한다', async () => {
    const rootShareData = {
      ...shareData,
      invitationUrl: 'https://invia.co.kr/',
    };
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        version: 1,
        published: true,
        guestUrl: 'https://invia.co.kr',
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: rootShareData,
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
      data: {
        ...rootShareData,
        invitationUrl: 'http://localhost/guest/data-json-file-id',
      },
      guestUrl: 'http://localhost/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
    });
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
