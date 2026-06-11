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

jest.mock('@/app/api/drive/_lib/findWorkspaceFolderId', () => ({
  findWorkspaceFolderId: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import { GET } from '@/app/api/drive/loadInvitation/route';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

function mockJsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(payload),
  };
}

describe('loadInvitation route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('워크스페이스가 없으면 빈 목록을 반환한다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      workspaceFolderId: null,
      invites: [],
      nextPageToken: null,
    });
    expect(googleFetch).not.toHaveBeenCalled();
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('meta.json 기준으로 초대장 목록 메타데이터를 채운다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(
      'workspace-folder-1'
    );

    (googleFetch as jest.Mock).mockImplementation((url: string) => {
      const decodedUrl = decodeURIComponent(url);

      if (url.includes('orderBy=createdTime+desc')) {
        return Promise.resolve(
          mockJsonResponse({
            files: [
              {
                id: 'folder-1',
                name: 'Invitation 1',
                createdTime: '2026-03-21T10:00:00.000Z',
                appProperties: { inv_id: 'uuid-1' },
              },
              {
                id: 'folder-2',
                name: 'Invitation 2',
                createdTime: '2026-03-20T10:00:00.000Z',
                appProperties: { inv_id: 'uuid-2' },
              },
              {
                id: 'folder-3',
                name: 'Invitation 3',
                createdTime: '2026-03-19T10:00:00.000Z',
                appProperties: {},
              },
            ],
            nextPageToken: 'next-page-token-123',
          })
        );
      }

      if (decodedUrl.includes('invitation_meta_json')) {
        if (decodedUrl.includes('folder-1')) {
          return Promise.resolve(
            mockJsonResponse({
              files: [{ id: 'meta-file-1' }],
            })
          );
        }

        return Promise.resolve(mockJsonResponse({ files: [] }));
      }

      if (url.includes('meta-file-1') && url.includes('alt=media')) {
        return Promise.resolve(
          mockJsonResponse({
            version: 1,
            published: true,
            guestUrl: '/guest/data-json-file-id-1',
            dataJsonFileId: 'data-json-file-id-1',
            kakaoShare: {
              title: 'Invitation 1',
              description: 'Description 1',
              showLocationButton: false,
            },
            updatedAt: '2026-03-21T10:00:00.000Z',
          })
        );
      }

      if (decodedUrl.includes('invitation_thumbnail')) {
        return Promise.resolve(mockJsonResponse({ files: [] }));
      }

      throw new Error(`Unexpected googleFetch url: ${url}`);
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      workspaceFolderId: 'workspace-folder-1',
      invites: [
        {
          folderId: 'folder-1',
          name: 'Invitation 1',
          createdTime: '2026-03-21T10:00:00.000Z',
          invitationUuid: 'uuid-1',
          dataJsonFileId: 'data-json-file-id-1',
          guestUrl: '/guest/data-json-file-id-1',
          published: true,
          readiness: 'ready',
          thumbnailUrl: null,
          hasKakaoShareData: true,
        },
        {
          folderId: 'folder-2',
          name: 'Invitation 2',
          createdTime: '2026-03-20T10:00:00.000Z',
          invitationUuid: 'uuid-2',
          guestUrl: null,
          published: false,
          readiness: 'idle',
          thumbnailUrl: null,
          hasKakaoShareData: false,
        },
      ],
      nextPageToken: 'next-page-token-123',
    });
    expect(googleFetch).toHaveBeenCalledTimes(6);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('초대장 목록 조회 실패 시 DriveHttpError 응답을 반환한다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(
      'workspace-folder-2'
    );
    (googleFetch as jest.Mock).mockResolvedValue(
      mockJsonResponse(
        {
          error: { message: 'drive unavailable' },
        },
        503
      )
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json).toEqual({
      message: '초대장 목록 조회 실패',
      details: {
        error: { message: 'drive unavailable' },
      },
    });
  });

  it('재로그인이 필요하면 401을 반환한다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('재로그인이 필요합니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ message: '재로그인이 필요합니다.' });
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('유효하지 않은 요청이면 400을 반환한다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('유효한 요청이 아닙니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ message: '유효한 요청이 아닙니다.' });
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('예상하지 못한 오류는 500을 반환한다', async () => {
    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('unexpected failure')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({
      message: '초대장 목록을 불러오는 중 오류가 발생했습니다.',
      error: 'unexpected failure',
    });
    expect(googleFetch).not.toHaveBeenCalled();
  });
});
