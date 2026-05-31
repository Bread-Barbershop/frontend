/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/drive/saveInvitation/route.ts 의 POST 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 정상 요청 시 workspace / invitation / data.json / assets / token 정보를 반환하는지
 * 2) auth_required 에러면 401을 반환하는지
 * 3) DriveHttpError면 지정된 status/message/details를 반환하는지
 * 4) 기타 예외면 500을 반환하는지
 *
 * 왜 중요한가:
 * 이 라우트는 저장/수정 작업을 시작하기 전에 필요한 모든 Drive 리소스를 보장한다.
 * 즉, 실제 저장 플로우의 서버 측 시작점이자 저장 인프라 백본이다.
 */

// ------------------------------
// ensureWorkspace 모듈 안의 DriveHttpError를 route가 사용하므로
// 클래스까지 포함해서 mock 처리한다.
// ------------------------------
jest.mock('@/app/api/drive/_lib/ensureWorkspace', () => ({
  ensureWorkspace: jest.fn(),
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
// 나머지 helper 함수 mock
// 실제 Drive API를 호출하지 않고 가짜 응답으로 route 분기만 검증한다.
// ------------------------------
jest.mock('@/app/api/drive/_lib/getFreshAccessToken', () => ({
  getFreshAccessToken: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureInvitationFolder', () => ({
  ensureInvitationFolder: jest.fn(),
  createInvitationFolder: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureDataJsonFile', () => ({
  ensureDataJsonFile: jest.fn(),
  createDataJsonFile: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensureAssetsFolder', () => ({
  ensureAssetsFolder: jest.fn(),
  createAssetsFolders: jest.fn(),
}));

import { POST } from '@/app/api/drive/saveInvitation/route';
import {
  createAssetsFolders,
  ensureAssetsFolder,
} from '@/app/api/drive/_lib/ensureAssetsFolder';
import {
  createDataJsonFile,
  ensureDataJsonFile,
} from '@/app/api/drive/_lib/ensureDataJsonFile';
import {
  createInvitationFolder,
  ensureInvitationFolder,
} from '@/app/api/drive/_lib/ensureInvitationFolder';
import {
  ensureWorkspace,
  DriveHttpError,
} from '@/app/api/drive/_lib/ensureWorkspace';
import { getFreshAccessToken } from '@/app/api/drive/_lib/getFreshAccessToken';

describe('saveInvitation Route Handler 테스트', () => {
  beforeEach(() => {
    /**
     * 각 테스트가 독립적으로 동작하도록 mock 상태를 초기화한다.
     */
    jest.resetAllMocks();
  });

  it('정상 요청 시 저장에 필요한 모든 리소스 정보를 반환한다', async () => {
    /**
     * 목적:
     * 저장 시작 시 필요한 token / workspace / invitation / data.json / assets 정보가
     * 모두 정상적으로 응답되는지 확인한다.
     */

    (getFreshAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
    });

    (ensureWorkspace as jest.Mock).mockResolvedValue({
      folderId: 'workspace-folder-id',
      reused: true,
    });

    (ensureInvitationFolder as jest.Mock).mockResolvedValue({
      invitationFolderId: 'invitation-folder-id',
      invitationUuid: 'invitation-uuid-123',
      reused: true,
    });

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id',
      reused: true,
    });

    (ensureAssetsFolder as jest.Mock).mockResolvedValue({
      imageFolderId: 'image-folder-id',
      audioFolderId: 'audio-folder-id',
      meta: {
        imageReused: true,
        audioReused: false,
      },
    });

    const req = new Request('http://localhost:3000/api/drive/saveInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationUuid: 'existing-invitation-uuid',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      workspaceFolderId: 'workspace-folder-id',
      invitationFolderId: 'invitation-folder-id',
      invitationUuid: 'invitation-uuid-123',
      imageFolderId: 'image-folder-id',
      audioFolderId: 'audio-folder-id',
      dataJsonFileId: 'data-json-file-id',
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
      meta: {
        workspaceReused: true,
        invitationReused: true,
        dataJsonReused: true,
        assets: {
          imageReused: true,
          audioReused: false,
        },
      },
    });

    /**
     * 내부 helper들이 순서에 맞게 호출되었는지 확인
     */
    expect(getFreshAccessToken).toHaveBeenCalledTimes(1);
    expect(ensureWorkspace).toHaveBeenCalledTimes(1);

    expect(ensureInvitationFolder).toHaveBeenCalledWith({
      workspaceFolderId: 'workspace-folder-id',
      invitationUuid: 'existing-invitation-uuid',
    });
    expect(createInvitationFolder).not.toHaveBeenCalled();

    expect(ensureDataJsonFile).toHaveBeenCalledWith('invitation-folder-id');
    expect(ensureAssetsFolder).toHaveBeenCalledWith('invitation-folder-id');
    expect(createDataJsonFile).not.toHaveBeenCalled();
    expect(createAssetsFolders).not.toHaveBeenCalled();
  });

  it('신규 초대장 폴더가 생성되면 하위 리소스를 검색하지 않고 바로 생성한다', async () => {
    (getFreshAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
    });

    (ensureWorkspace as jest.Mock).mockResolvedValue({
      folderId: 'workspace-folder-id',
      reused: true,
    });

    (createInvitationFolder as jest.Mock).mockResolvedValue({
      invitationFolderId: 'new-invitation-folder-id',
      invitationUuid: 'new-invitation-uuid-123',
      reused: false,
    });

    (createDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'new-data-json-file-id',
      reused: false,
    });

    (createAssetsFolders as jest.Mock).mockResolvedValue({
      imageFolderId: 'new-image-folder-id',
      audioFolderId: 'new-audio-folder-id',
      meta: {
        imageReused: false,
        audioReused: false,
      },
    });

    const req = new Request('http://localhost:3000/api/drive/saveInvitation', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      workspaceFolderId: 'workspace-folder-id',
      invitationFolderId: 'new-invitation-folder-id',
      invitationUuid: 'new-invitation-uuid-123',
      imageFolderId: 'new-image-folder-id',
      audioFolderId: 'new-audio-folder-id',
      dataJsonFileId: 'new-data-json-file-id',
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
      meta: {
        workspaceReused: true,
        invitationReused: false,
        dataJsonReused: false,
        assets: {
          imageReused: false,
          audioReused: false,
        },
      },
    });

    expect(createDataJsonFile).toHaveBeenCalledWith(
      'new-invitation-folder-id'
    );
    expect(createAssetsFolders).toHaveBeenCalledWith(
      'new-invitation-folder-id'
    );
    expect(ensureDataJsonFile).not.toHaveBeenCalled();
    expect(ensureAssetsFolder).not.toHaveBeenCalled();
    expect(ensureInvitationFolder).not.toHaveBeenCalled();
    expect(createInvitationFolder).toHaveBeenCalledWith({
      workspaceFolderId: 'workspace-folder-id',
    });
  });

  it('auth_required 에러면 401을 반환한다', async () => {
    /**
     * 목적:
     * 인증이 만료되었거나 access token을 얻을 수 없는 경우
     * route가 401을 반환하는지 확인한다.
     */

    (getFreshAccessToken as jest.Mock).mockRejectedValue(
      new Error('auth_required')
    );

    const req = new Request('http://localhost:3000/api/drive/saveInvitation', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json).toEqual({
      message: '재로그인이 필요합니다.',
    });

    /**
     * 인증 단계에서 실패했으므로 이후 helper는 호출되면 안 된다.
     */
    expect(ensureWorkspace).not.toHaveBeenCalled();
    expect(ensureInvitationFolder).not.toHaveBeenCalled();
    expect(createInvitationFolder).not.toHaveBeenCalled();
    expect(ensureDataJsonFile).not.toHaveBeenCalled();
    expect(ensureAssetsFolder).not.toHaveBeenCalled();
  });

  it('DriveHttpError가 발생하면 해당 status/message/details를 반환한다', async () => {
    /**
     * 목적:
     * Drive 관련 helper에서 DriveHttpError가 발생했을 때
     * route가 그 정보를 그대로 응답으로 변환하는지 확인한다.
     */

    (getFreshAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
    });

    (ensureWorkspace as jest.Mock).mockRejectedValue(
      new DriveHttpError('워크스페이스 생성 실패', 503, {
        reason: 'drive unavailable',
      })
    );

    const req = new Request('http://localhost:3000/api/drive/saveInvitation', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json).toEqual({
      message: '워크스페이스 생성 실패',
      details: {
        reason: 'drive unavailable',
      },
    });

    /**
     * workspace 단계에서 실패했으므로 이후 helper는 호출되지 않아야 한다.
     */
    expect(ensureInvitationFolder).not.toHaveBeenCalled();
    expect(ensureDataJsonFile).not.toHaveBeenCalled();
    expect(ensureAssetsFolder).not.toHaveBeenCalled();
  });

  it('기타 예외는 500을 반환한다', async () => {
    /**
     * 목적:
     * 명시적으 분기되지 않은 일반 예외는
     * 안전하게 500 응답으로 처리하는지 확인한다.
     */

    (getFreshAccessToken as jest.Mock).mockResolvedValue({
      accessToken: 'fresh-access-token',
      expiresAt: 1760000000000,
    });

    (ensureWorkspace as jest.Mock).mockResolvedValue({
      folderId: 'workspace-folder-id',
      reused: true,
    });

    (ensureInvitationFolder as jest.Mock).mockRejectedValue(
      new Error('unexpected invitation folder failure')
    );

    const req = new Request('http://localhost:3000/api/drive/saveInvitation', {
      method: 'POST',
      body: JSON.stringify({ invitationUuid: 'existing-invitation-uuid' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({
      message: '알 수 없는 오류',
      details: 'unexpected invitation folder failure',
    });

    /**
     * invitation 단계에서 실패했으므로 이후 helper는 호출되지 않아야 한다.
     */
    expect(ensureDataJsonFile).not.toHaveBeenCalled();
    expect(ensureAssetsFolder).not.toHaveBeenCalled();
  });
});
