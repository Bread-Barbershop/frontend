/**
 * @jest-environment node
 */

import { GET } from '@/app/api/drive/publishInvitation/readiness/route';

const validGuestPayload = {
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'font-maruburi',
      fontSize: '20px',
      color: '#FA7564',
      bold: false,
      italic: false,
      align: 'center',
      isDefault: false,
    },
    bodyData: {
      font: 'font-maruburi',
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

const mockFetch = jest.fn();

global.fetch = mockFetch as unknown as typeof fetch;

describe('publishInvitation readiness Route Handler 테스트', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dataJsonFileId가 없으면 400을 반환한다', async () => {
    const req = new Request(
      'http://localhost/api/drive/publishInvitation/readiness'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      ok: false,
      error: 'dataJsonFileId required',
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('guest 데이터가 준비되어 있으면 ready true를 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const req = new Request(
      'http://localhost/api/drive/publishInvitation/readiness?dataJsonFileId=data-json-file-id-1'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: true,
      guestUrl: '/guest/data-json-file-id-1',
      dataJsonFileId: 'data-json-file-id-1',
      details: {
        ok: true,
        status: 200,
      },
    });
  });

  it('guest 데이터가 아직 준비되지 않았으면 202 pending을 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('not found'),
    });

    const req = new Request(
      'http://localhost/api/drive/publishInvitation/readiness?dataJsonFileId=data-json-file-id-2'
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(202);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: false,
      guestUrl: '/guest/data-json-file-id-2',
      dataJsonFileId: 'data-json-file-id-2',
      warning: 'guest_not_ready',
      status: 202,
      details: {
        ok: false,
        status: 404,
        reason: 'http_not_ok',
      },
    });
  });

  it('guest 데이터 확인 요청이 오래 걸리면 timeout pending을 반환한다', async () => {
    jest.useFakeTimers();

    mockFetch.mockImplementation(
      (_url: string, init?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        })
    );

    const req = new Request(
      'http://localhost/api/drive/publishInvitation/readiness?dataJsonFileId=data-json-file-id-timeout'
    );

    const responsePromise = GET(req);

    await jest.advanceTimersByTimeAsync(3000);

    const res = await responsePromise;
    const json = await res.json();

    expect(res.status).toBe(202);
    expect(json).toMatchObject({
      ok: true,
      published: true,
      ready: false,
      guestUrl: '/guest/data-json-file-id-timeout',
      dataJsonFileId: 'data-json-file-id-timeout',
      warning: 'guest_not_ready',
      status: 202,
      details: {
        ok: false,
        status: 0,
        reason: 'fetch_timeout',
      },
    });
  });
});
