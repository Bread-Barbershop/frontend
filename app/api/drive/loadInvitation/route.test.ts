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

  it('returns an empty list when the workspace does not exist', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      workspaceFolderId: null,
      invites: [],
      nextPageToken: null,
      emptyReason: 'WORKSPACE_NOT_FOUND',
    });
    expect(googleFetch).not.toHaveBeenCalled();
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns invitations with publishedUrl hydrated from published.json', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue('workspace-folder-1');

    (googleFetch as jest.Mock).mockImplementation((url: string) => {
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

      if (url.includes('files%3F') || url.includes('files?')) {
        if (url.includes('folder-1')) {
          return Promise.resolve(
            mockJsonResponse({
              files: [{ id: 'published-file-1' }],
            })
          );
        }

        if (url.includes('folder-2')) {
          return Promise.resolve(
            mockJsonResponse({
              files: [],
            })
          );
        }
      }

      if (url.includes('published-file-1') && url.includes('alt=media')) {
        return Promise.resolve(
          mockJsonResponse({
            guestUrl: '/guest/data-json-file-id-1',
          })
        );
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
          publishedUrl: '/guest/data-json-file-id-1',
        },
        {
          folderId: 'folder-2',
          name: 'Invitation 2',
          createdTime: '2026-03-20T10:00:00.000Z',
          invitationUuid: 'uuid-2',
          publishedUrl: null,
        },
      ],
      nextPageToken: 'next-page-token-123',
    });
    expect(googleFetch).toHaveBeenCalledTimes(4);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('returns a DriveHttpError response when the invitation list lookup fails', async () => {
    (findWorkspaceFolderId as jest.Mock).mockResolvedValue('workspace-folder-2');
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

  it('returns 401 when re-login is required', async () => {
    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('재로그인이 필요합니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({ message: '재로그인이 필요합니다.' });
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('returns 400 when the request is invalid', async () => {
    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('유효한 요청이 아닙니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ message: '유효한 요청이 아닙니다.' });
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('returns 500 for unexpected failures', async () => {
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
