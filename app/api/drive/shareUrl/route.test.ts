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
jest.mock('@/app/api/drive/_lib/invitationAudiences', () => ({
  getOwnedAudienceLink: jest.fn(),
  updateAudienceLinkTarget: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/getSaveDataFetch', () => ({
  downloadFiles: jest.fn(),
}));

import { GET, POST } from '@/app/api/drive/shareUrl/route';
import {
  loadInvitationMeta,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { downloadFiles } from '@/app/api/drive/_lib/getSaveDataFetch';
import { getOrCreateShortCode } from '@/app/api/short-url/_lib/shortUrlStore';
import {
  getOwnedAudienceLink,
  updateAudienceLinkTarget,
} from '@/app/api/drive/_lib/invitationAudiences';

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
    (downloadFiles as jest.Mock).mockResolvedValue({ bulkData: {} });
    (getOrCreateShortCode as jest.Mock).mockResolvedValue({
      shortCode: 'aB7kQ2x',
      guestPath: '/i/aB7kQ2x',
    });
  });

  it('하객 그룹 저장 시 초대장 대표 URL에 대상을 붙이고 별도 짧은 링크를 발급하지 않는다', async () => {
    const guestUrl = 'http://localhost/i/aB7kQ2x?to=family';
    jest.mocked(getOwnedAudienceLink).mockResolvedValue({
      rootFolderId: 'root-folder',
      rootDataJsonFileId: 'root-data-file',
      requestId: 'claim-key',
      guestUrl,
      published: false,
      group: {
        folderId: 'group-folder',
        invitationUuid: 'aud_group',
        name: '가족',
        slug: 'family',
      },
    });
    jest.mocked(updateAudienceLinkTarget).mockResolvedValue('group-data-file');
    jest.mocked(upsertInvitationMeta).mockResolvedValue({
      metaFileId: 'meta-group-file',
      reused: true,
      payload: {
        version: 1,
        published: false,
        updatedAt: '2026-11-18T00:00:00Z',
        guestUrl,
        dataJsonFileId: 'group-data-file',
        kakaoShare: { ...shareData, invitationUrl: guestUrl },
      },
    });

    const response = await POST(
      new Request('http://localhost/api/drive/shareUrl', {
        method: 'POST',
        body: JSON.stringify({
          invitationFolderId: 'group-folder',
          dataJsonFileId: 'group-data-file',
          shareData,
        }),
      })
    );

    expect(await response.json()).toMatchObject({
      ok: true,
      guestUrl,
      shortCode: null,
    });
    expect(upsertInvitationMeta).toHaveBeenCalledWith(
      'group-folder',
      expect.objectContaining({
        guestUrl,
        dataJsonFileId: 'group-data-file',
        kakaoShare: expect.objectContaining({ invitationUrl: guestUrl }),
      })
    );
    expect(getOrCreateShortCode).not.toHaveBeenCalled();
  });

  it('하객 그룹 공유는 메타데이터가 오래돼도 현재 그룹의 개인정보 설정을 읽는다', async () => {
    const guestUrl = 'http://localhost/i/aB7kQ2x?to=family';
    jest.mocked(getOwnedAudienceLink).mockResolvedValue({
      rootFolderId: 'root-folder',
      rootDataJsonFileId: 'root-data-file',
      requestId: 'claim-key',
      guestUrl,
      published: true,
      group: {
        folderId: 'group-folder',
        invitationUuid: 'aud_group',
        name: '가족',
        slug: 'family',
      },
    });
    jest.mocked(updateAudienceLinkTarget).mockResolvedValue('current-group-data');
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'group-meta',
      payload: { dataJsonFileId: 'old-data', kakaoShare: shareData },
    });
    (downloadFiles as jest.Mock).mockImplementation(async id => ({
      bulkData: id === 'current-group-data'
        ? { invitationPrivacy: { enabled: true, eventDate: '2000-01-01', fields: ['name'] } }
        : {},
    }));

    const response = await GET(new Request(
      'http://localhost/api/drive/shareUrl?invitationFolderId=group-folder'
    ));
    expect(await response.json()).toMatchObject({
      data: { title: '', description: '', invitationUrl: guestUrl },
      dataJsonFileId: 'current-group-data',
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

  it('행사가 지난 뒤 새 카카오 공유에 이름·썸네일·지도 정보를 넣지 않는다', async () => {
    (loadInvitationMeta as jest.Mock).mockResolvedValue({
      metaFileId: 'meta-file-id',
      payload: {
        dataJsonFileId: 'data-json-file-id',
        kakaoShare: {
          ...shareData,
          title: '김민준의 초대장',
          showLocationButton: true,
          locationInfo: { placeName: '장소', lat: 37, lng: 127 },
        },
      },
    });
    (downloadFiles as jest.Mock).mockResolvedValue({
      bulkData: {
        invitationPrivacy: {
          enabled: true,
          eventDate: '2000-01-01',
          fields: ['name', 'media', 'location'],
        },
      },
    });

    const res = await GET(new Request(
      'http://localhost/api/drive/shareUrl?invitationFolderId=invitation-folder-id'
    ));
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual({
      title: '',
      description: '',
      showLocationButton: false,
      invitationUrl: 'http://localhost/guest/data-json-file-id',
    });
  });
});
