/**
 * @jest-environment node
 */

/**
 * 파일 위치 예시:
 * __tests__/publishInvitation.test.ts
 *
 * 목적:
 * app/api/drive/publishInvitation/route.ts 의 POST 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) invitationFolderId가 없으면 400을 반환하는지
 * 2) publish 성공 + guest 데이터 준비 완료 시 200을 반환하는지
 * 3) 이미 공개 상태(already_public)도 성공 흐름으로 처리하는지
 * 4) publish 권한 부여 실패 시 적절한 실패 응답을 반환하는지
 * 5) publish는 성공했지만 guest 데이터가 끝내 준비되지 않으면 502를 반환하는지
 *
 * 중요한 포인트:
 * - 실제 Google Drive API를 호출하지 않는다.
 * - 실제 캐시 무효화를 수행하지 않는다.
 * - 실제 공개 URL을 호출하지 않는다.
 * - 대신 mock을 사용해서 "이 상황에서 우리 코드가 어떤 응답을 만드는가"만 검증한다.
 */

import { POST } from '@/app/api/drive/publishInvitation/route';

// ------------------------------
// next/cache는 테스트 환경에서 실제 동작이 필요 없으므로 mock 처리
// ------------------------------
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// ------------------------------
// data.json 파일 보장 함수 mock
// 실제 Drive를 건드리지 않고 가짜 응답을 준다.
// ------------------------------
jest.mock('@/app/api/drive/_lib/ensureDataJsonFile', () => ({
  ensureDataJsonFile: jest.fn(),
}));

// ------------------------------
// publish 권한 부여 함수 mock
// 실제 공개 권한 처리를 하지 않고 가짜 응답을 준다.
// ------------------------------
jest.mock('@/app/api/drive/_lib/publishPermissionWithRetry', () => ({
  publishPermissionWithRetry: jest.fn(),
}));

jest.mock('@/app/api/drive/_lib/ensurePublishedJsonFile', () => ({
  ensurePublishedJsonFile: jest
    .fn()
    .mockResolvedValue({ fileId: 'published-file-1' }),
}));

import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

// ------------------------------
// guest readiness 확인용 정상 payload 샘플
// route 내부의 최소 guest payload 조건을 만족하도록 구성
// ------------------------------
const validGuestPayload = {
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'font-lineseed',
      fontSize: '20px',
      color: '#FA7564',
      bold: false,
      italic: false,
      align: 'center',
      isDefault: false,
    },
    bodyData: {
      font: 'font-lineseed',
      fontSize: '16px',
      color: '#222222',
      bold: false,
      italic: false,
      align: 'left',
      isDefault: false,
    },
    isZoom: false,
  },
  blocks: [],
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.2,
    userBgmTitle: null,
    userBgmDuration: null,
    userBgmFileId: null,
  },
  mainPoster: {
    version: '7.1.0',
    objects: [],
  },
};

// ------------------------------
// fetch mock
// route 내부에서 공개 guest 데이터 readiness 확인에 사용됨
// ------------------------------
const mockFetch = jest.fn();

// 테스트 환경의 global.fetch를 mock으로 교체
global.fetch = mockFetch as unknown as typeof fetch;

describe('publishInvitation Route Handler 테스트', () => {
  beforeEach(() => {
    /**
     * resetAllMocks를 사용하는 이유:
     * - 호출 기록만 비우는 clearAllMocks와 달리
     * - 이전 테스트에서 설정한 mockResolvedValue / mockImplementation까지 함께 초기화한다.
     *
     * 통신 테스트는 테스트마다 외부 응답 상황을 다르게 가정하므로
     * mock 구현이 남아 있으면 테스트 순서에 따라 결과가 흔들릴 수 있다.
     */
    jest.resetAllMocks();

    /**
     * fake timer를 사용하는 테스트가 있으므로
     * 각 테스트 시작 시 real timer로 되돌린다.
     */
    jest.useRealTimers();

    /**
     * resetAllMocks 이후 global.fetch를 다시 mock 함수로 연결한다.
     */
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('invitationFolderId가 없으면 400을 반환한다', async () => {
    /**
     * 목적:
     * 요청 body에 invitationFolderId가 없을 때,
     * route가 즉시 400을 반환하는지 확인다.
     *
     * 기대:
     * - status 400
     * - 외부 의존 함수 호출 없음
     */

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      ok: false,
      error: 'invitationFolderId required',
    });

    expect(ensureDataJsonFile).not.toHaveBeenCalled();
    expect(publishPermissionWithRetry).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('publish 성공 후 guest 데이터가 준비되면 200을 반환한다', async () => {
    /**
     * 목적:
     * - invitationFolderId가 정상적으로 들어오고
     * - publish 권한 부여가 성공하고
     * - guest data readiness 확인도 성공했을 때
     * 최종 성공 응답(200)을 반환하는지 확인한다.
     */

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id-1',
    });

    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationFolderId: 'folder-123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: true,
      guestUrl: '/guest/data-json-file-id-1',
      dataJsonFileId: 'data-json-file-id-1',
    });

    expect(ensureDataJsonFile).toHaveBeenCalledWith('folder-123');
    expect(publishPermissionWithRetry).toHaveBeenCalledWith('folder-123');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://drive.google.com/uc?export=download&id=data-json-file-id-1',
      { cache: 'no-store', signal: expect.any(AbortSignal) }
    );
  });

  it('이미 공개 상태(already_public)인 경우에도 성공 응답을 반환한다', async () => {
    /**
     * 목적:
     * publishPermissionWithRetry가
     * "이미 공개 상태라서 새로 공개할 필요는 없지만 결과적으로는 성공"인 경우를
     * route가 정상 성공 흐름으로 처리하는지 확인한다.
     *
     * 이 케이스는 route 내부에서 특별 분기로 처리되므로 별도 테스트가 필요하다.
     */

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id-3',
    });

    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
      ignored: 'already_public',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationFolderId: 'folder-already-public',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    /**
     * 기대:
     * - status는 여전히 200
     * - ignored: 'already_public'가 포함된 성공 응답
     */
    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: true,
      guestUrl: '/guest/data-json-file-id-3',
      dataJsonFileId: 'data-json-file-id-3',
      ignored: 'already_public',
    });

    expect(ensureDataJsonFile).toHaveBeenCalledWith('folder-already-public');
    expect(publishPermissionWithRetry).toHaveBeenCalledWith(
      'folder-already-public'
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('publish 권한 부여가 실패하면 publish_permission_failed 응답을 반환한다', async () => {
    /**
     * 목적:
     * publishPermissionWithRetry 단계에서 실패가 발생했을 때
     * route가 적절한 실패 응답(status, error, details 등)을 반환하는지 확인한다.
     *
     * 이 경우에는 guest readiness 단계까지 가지 않아야 한다.
     */

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id-4',
    });

    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: false,
      attempt: 2,
      status: 503,
      immediateFail: false,
      details: {
        message: 'temporary drive error',
      },
      error: 'drive publish failed',
    });

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationFolderId: 'folder-publish-fail',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    /**
     * 기대:
     * - publish 단계 실패이므로 route는 실패 응답을 반환
     * - error 필드는 publish_permission_failed
     * - guest readiness 확인(fetch)은 호출되지 않아야 함
     */
    expect(res.status).toBe(503);
    expect(json).toEqual({
      ok: false,
      guestUrl: '/guest/data-json-file-id-4',
      dataJsonFileId: 'data-json-file-id-4',
      error: 'publish_permission_failed',
      status: 503,
      attempts: 2,
      immediateFail: false,
      details: {
        message: 'temporary drive error',
      },
      cause: 'drive publish failed',
    });

    expect(ensureDataJsonFile).toHaveBeenCalledWith('folder-publish-fail');
    expect(publishPermissionWithRetry).toHaveBeenCalledWith(
      'folder-publish-fail'
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('publish는 성공했지만 guest 데이터가 끝내 준비되지 않으면 502를 반환한다', async () => {
    /**
     * 목적:
     * publish 권한 부여는 성공했지만,
     * guest 데이터 readiness 확인이 재시도 끝까지 실패하면
     * 최종적으로 502를 반환하는지 확인한다.
     *
     * 이 케이스는 publish 성공만으로 끝내지 않고,
     * 실제 guest 페이지가 읽을 수 있는 상태까지 검증하는
     * 현재 아키텍처의 안정성을 보여주는 핵심 테스트다.
     */

    jest.useFakeTimers();

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id-2',
    });

    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
    });

    // readiness probe가 3번 모두 실패하도록 설정
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('not found'),
    });

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationFolderId: 'folder-999',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responsePromise = POST(req);

    /**
     * route 내부 재시도 로직의 delay를 직접 흘려보낸다.
     * VERIFY_MAX_ATTEMPTS = 3이고 시도 사이에 sleep이 있으므로
     * 충분한 시간을 advance 해준다.
     */
    await jest.advanceTimersByTimeAsync(1000);

    const res = await responsePromise;
    const json = await res.json();

    expect(res.status).toBe(202);
    expect(json.ok).toBe(true);
    expect(json.published).toBe(true);
    expect(json.ready).toBe(false);
    expect(json.warning).toBe('guest_not_ready_after_publish');
    expect(json.status).toBe(202);
    expect(json.guestUrl).toBe('/guest/data-json-file-id-2');
    expect(json.dataJsonFileId).toBe('data-json-file-id-2');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(ensureDataJsonFile).toHaveBeenCalledWith('folder-999');
    expect(publishPermissionWithRetry).toHaveBeenCalledWith('folder-999');
  });

  it('guest readiness fetch 자체가 실패해도 발행 완료 상태는 유지한다', async () => {
    jest.useFakeTimers();

    (ensureDataJsonFile as jest.Mock).mockResolvedValue({
      dataJsonFileId: 'data-json-file-id-fetch-error',
    });

    (publishPermissionWithRetry as jest.Mock).mockResolvedValue({
      ok: true,
      attempt: 1,
    });

    mockFetch.mockRejectedValue(new Error('network unavailable'));

    const req = new Request('http://localhost/api/drive/publishInvitation', {
      method: 'POST',
      body: JSON.stringify({
        invitationFolderId: 'folder-fetch-error',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responsePromise = POST(req);

    await jest.advanceTimersByTimeAsync(1000);

    const res = await responsePromise;
    const json = await res.json();

    expect(res.status).toBe(202);
    expect(json).toMatchObject({
      ok: true,
      published: true,
      ready: false,
      warning: 'guest_not_ready_after_publish',
      guestUrl: '/guest/data-json-file-id-fetch-error',
      dataJsonFileId: 'data-json-file-id-fetch-error',
      status: 202,
    });
    expect(json.details.lastProbe).toMatchObject({
      ok: false,
      status: 0,
      reason: 'fetch_failed',
      error: 'network unavailable',
    });

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
