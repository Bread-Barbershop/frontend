/**
 * @jest-environment node
 */

import {
  GUEST_PAYLOAD_FETCH_TIMEOUT_MS,
  isPrivateDriveBody,
  loadGuestPayload,
} from '@/app/guest/[id]/server/loadGuestPayload';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const validGuestPayload = {
  mainPoster: {
    version: '1.0.0',
    objects: [],
    background: '#ffffff',
    thumbnailFileId: 'thumbnail-file-id',
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
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: {
      font: 'font-lineseed',
      fontSize: '20px',
      fontWeight: '700',
      color: '#FA7564',
      isDefault: false,
    },
    bodyData: {
      font: 'font-lineseed',
      fontSize: '16px',
      fontWeight: '500',
      color: '#000000',
      isDefault: false,
    },
    isZoom: false,
  },
};

describe('loadGuestPayload', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('공개 Drive JSON이 유효하면 payload를 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const result = await loadGuestPayload('valid-loader-file-id');

    expect(result).toEqual({
      status: 'ok',
      payload: validGuestPayload,
      warnings: [],
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://drive.google.com/uc?export=download&id=valid-loader-file-id',
      expect.objectContaining({
        cache: 'no-store',
        next: { tags: ['invitation:valid-loader-file-id'] },
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('비공개 Drive status면 private 상태를 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: jest.fn(),
    });

    await expect(loadGuestPayload('private-loader-file-id')).resolves.toEqual({
      status: 'private',
    });
  });

  it('Drive가 HTML 본문을 반환하면 private 상태를 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<!doctype html><html></html>'),
    });

    await expect(loadGuestPayload('html-loader-file-id')).resolves.toEqual({
      status: 'private',
    });
  });

  it('JSON 파싱 실패는 not-found 상태로 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('{ broken json'),
    });

    await expect(loadGuestPayload('broken-loader-file-id')).resolves.toEqual({
      status: 'not-found',
      reason: 'json_parse_failed',
    });
  });

  it('payload 구조가 맞지 않으면 not-found 상태로 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify({ blocks: [] })),
    });

    await expect(
      loadGuestPayload('invalid-loader-file-id')
    ).resolves.toMatchObject({
      status: 'not-found',
      reason: 'invalid_payload',
    });
  });

  it('fetch 응답이 오지 않으면 10초 deadline에 abort하고 unavailable을 반환한다', async () => {
    jest.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    mockFetch.mockImplementationOnce(
      (_url: string, options: { signal: AbortSignal }) => {
        requestSignal = options.signal;
        return new Promise(() => undefined);
      }
    );

    const request = loadGuestPayload('slow-loader-file-id');
    await jest.advanceTimersByTimeAsync(GUEST_PAYLOAD_FETCH_TIMEOUT_MS);

    await expect(request).resolves.toEqual({
      status: 'unavailable',
      reason: 'fetch_timeout',
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  it('본문 읽기가 10초 이상 멈추면 unavailable을 반환한다', async () => {
    jest.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    mockFetch.mockImplementationOnce(
      (_url: string, options: { signal: AbortSignal }) => {
        requestSignal = options.signal;
        return Promise.resolve({
          ok: true,
          text: () => new Promise(() => undefined),
        });
      }
    );

    const request = loadGuestPayload('slow-body-loader-file-id');
    await jest.advanceTimersByTimeAsync(GUEST_PAYLOAD_FETCH_TIMEOUT_MS);

    await expect(request).resolves.toEqual({
      status: 'unavailable',
      reason: 'fetch_timeout',
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  it('응답 본문을 읽는 중 네트워크 오류가 나면 unavailable을 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: jest.fn().mockRejectedValue(new Error('body network error')),
    });

    await expect(loadGuestPayload('broken-body-loader-file-id')).resolves.toEqual({
      status: 'unavailable',
      reason: 'fetch_failed',
    });
  });

  it('Drive 5xx 응답은 일시적 unavailable 상태로 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      text: jest.fn(),
    });

    await expect(loadGuestPayload('temporarily-unavailable-file-id')).resolves.toEqual({
      status: 'unavailable',
      reason: 'http_unavailable',
    });
  });
});

describe('isPrivateDriveBody', () => {
  it('Drive 권한 HTML 응답을 감지한다', () => {
    expect(isPrivateDriveBody('   <html><body>login</body></html>')).toBe(true);
    expect(isPrivateDriveBody(JSON.stringify(validGuestPayload))).toBe(false);
  });
});
