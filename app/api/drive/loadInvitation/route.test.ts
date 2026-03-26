/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/drive/loadInvitation/route.ts 의 GET 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) workspace가 없으면 빈 목록을 반환하는지
 * 2) 정상 조회 시 invite 목록을 반환하는
 * 3) Google Drive 조회 실패 시 DriveHttpError 기반 에러 응답을 반환하는지
 * 4) 재로그인이 필요한 경우 401을 반환하는지
 *
 * 왜 중요한가:
 * 이 라우트는 "로그인 사용자가 자신의 초대장 목록을 볼 수 있는가"를 결정하는
 * 관리/운영 흐름의 핵심 API다.
 */

// ------------------------------
// DriveHttpError class를 route가 import하는 모듈과 같은 경로에서 mock한다.
// route 내부에서 new DriveHttpError(...)를 생성하므로,
// 테스트에서도 동일한 클래스 레퍼런스를 사용할 수 있도록 한다.
// ------------------------------
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

// ------------------------------
// workspace 찾기 함수 mock
// ------------------------------
jest.mock('@/app/api/drive/_lib/findWorkspaceFolderId', () => ({
  findWorkspaceFolderId: jest.fn(),
}));

// ------------------------------
// Google Drive 조회 함수 mock
// ------------------------------
jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import { GET } from '@/app/api/drive/loadInvitation/route';
import { findWorkspaceFolderId } from '@/app/api/drive/_lib/findWorkspaceFolderId';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

describe('loadInvitation Route Handler 테스트', () => {
  beforeEach(() => {
    /**
     * 각 테스트가 독립적으로 동작하도록 mock 상태를 초기화한다.
     */
    jest.resetAllMocks();
  });

  it('workspace가 없으면 빈 목록을 반환한다', async () => {
    /**
     * 목적:
     * 아직 workspace가 없는 사용자라면
     * "초대장이 하나도 없는 상태"로 간주하고
     * 빈 목록 응답을 반환하는지 확인한다.
     */

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

    /**
     * workspace가 없으면 Google Drive 목록 조회까지는 가지 않아야 한다.
     */
    expect(googleFetch).not.toHaveBeenCalled();

    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('정상 조회 시 invite 목록을 반환한다', async () => {
    /**
     * 목적:
     * workspace가 존재하고 Google Drive 목록 조회도 성공하면
     * route가 invite 목록을 가공해서 반환하는지 확인한다.
     */

    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(
      'workspace-folder-1'
    );

    (googleFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        files: [
          {
            id: 'folder-1',
            name: 'Invitation 1',
            createdTime: '2026-03-21T10:00:00.000Z',
            appProperties: {
              inv_id: 'uuid-1',
            },
          },
          {
            id: 'folder-2',
            name: 'Invitation 2',
            createdTime: '2026-03-20T10:00:00.000Z',
            appProperties: {
              inv_id: 'uuid-2',
            },
          },
          /**
           * 이 항목은 inv_id가 없으므로 최종 invites 결과에서 제외되어야 한다.
           */
          {
            id: 'folder-3',
            name: 'Invitation 3',
            createdTime: '2026-03-19T10:00:00.000Z',
            appProperties: {},
          },
        ],
        nextPageToken: 'next-page-token-123',
      }),
    });

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);

    /**
     * route는 files 배열을 invite 목록 형식으로 가공하고,
     * invitationUuid가 없는 항목은 걸러낸다.
     */
    expect(json).toEqual({
      workspaceFolderId: 'workspace-folder-1',
      invites: [
        {
          folderId: 'folder-1',
          name: 'Invitation 1',
          createdTime: '2026-03-21T10:00:00.000Z',
          invitationUuid: 'uuid-1',
        },
        {
          folderId: 'folder-2',
          name: 'Invitation 2',
          createdTime: '2026-03-20T10:00:00.000Z',
          invitationUuid: 'uuid-2',
        },
      ],
      nextPageToken: 'next-page-token-123',
    });

    expect(googleFetch).toHaveBeenCalledTimes(1);

    /**
     * 조회 결과도 no-store 헤더를 가져야 한다.
     */
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('Google Drive 조회가 실패하면 DriveHttpError 기반 에러 응답을 반환한다', async () => {
    /**
     * 목적:
     * workspace는 존재하지만 Google Drive 목록 조회 응답이 실패하면
     * route 내부에서 DriveHttpError를 만들어 적절한 에러 응답을 반환하는지 확인한다.
     */

    (findWorkspaceFolderId as jest.Mock).mockResolvedValue(
      'workspace-folder-2'
    );

    (googleFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      json: jest.fn().mockResolvedValue({
        error: {
          message: 'drive unavailable',
        },
      }),
    });

    const res = await GET();
    const json = await res.json();

    /**
     * route 내부에서
     * new DriveHttpError('초대장 목록 조회 실패', listRes.status, listData)
     * 를 던지고 catch에서 이를 응답으로 변환한다.
     */
    expect(res.status).toBe(503);
    expect(json).toEqual({
      message: '초대장 목록 조회 실패',
      details: {
        error: {
          message: 'drive unavailable',
        },
      },
    });
  });

  it('재로그인이 필요한 경우 401을 반환한다', async () => {
    /**
     * 목적:
     * 내부 helper에서 "재로그인이 필요합니다." 에러를 던진 경우
     * route가 이를 401로 변환하는지 확인한다.
     */

    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('재로그인이 필요합니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({
      message: '재로그인이 필요합니다.',
    });

    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('유효하지 않은 요청 에러면 400을 반환한다', async () => {
    /**
     * 목적:
     * helper에서 "유효한 요청이 아닙니다."를 던지는 경우
     * route가 이를 400으로 처리하는지 확인한다.
     *
     * 이 케이스는 route의 명시적 분기이므로 테스트해두면 안전하다.
     */

    (findWorkspaceFolderId as jest.Mock).mockRejectedValue(
      new Error('유효한 요청이 아닙니다.')
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      message: '유효한 요청이 아닙니다.',
    });

    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('기타 예외는 500으로 처리한다', async () => {
    /**
     * 목적:
     * 명시적으로 분기되지 않은 일반 예외는
     * 500 응답으로 안전하게 처리하는지 확인한다.
     */

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
