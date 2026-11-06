/**
 * @jest-environment node
 */

import { probeGuestData } from './guestReadiness';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const validGuestPayload = {
  mainPoster: {
    version: '1.0.0',
    objects: [],
    thumbnailFileId: 'thumbnail-file-id-12345',
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

describe('probeGuestData', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('payload와 Drive 대표 이미지가 공개로 읽히면 준비 완료로 판단한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'image/webp' },
        body: { cancel: jest.fn().mockResolvedValue(undefined) },
      });

    await expect(probeGuestData('data-json-file-id')).resolves.toEqual({
      ok: true,
      status: 200,
    });
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://lh3.googleusercontent.com/d/thumbnail-file-id-12345',
      expect.objectContaining({ cache: 'no-store' })
    );
  });

  it('data.json 본문이 deadline 안에 오지 않으면 abort하고 timeout으로 응답한다', async () => {
    jest.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    mockFetch.mockImplementationOnce(
      (_url: string, options: { signal: AbortSignal }) => {
        requestSignal = options.signal;
        return Promise.resolve({ ok: true, status: 200, text: () => new Promise(() => undefined) });
      }
    );

    const probe = probeGuestData('slow-data-json-file-id');
    await jest.advanceTimersByTimeAsync(3000);

    await expect(probe).resolves.toMatchObject({
      ok: false,
      reason: 'fetch_timeout',
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  it('대표 이미지 응답이 deadline 안에 오지 않으면 abort하고 timeout으로 응답한다', async () => {
    jest.useFakeTimers();
    let imageRequestSignal: AbortSignal | undefined;
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
      })
      .mockImplementationOnce(
        (_url: string, options: { signal: AbortSignal }) => {
          imageRequestSignal = options.signal;
          return new Promise(() => undefined);
        }
      );

    const probe = probeGuestData('slow-thumbnail-data-json-id');
    await jest.advanceTimersByTimeAsync(3000);

    await expect(probe).resolves.toMatchObject({
      ok: false,
      reason: 'fetch_timeout',
    });
    expect(imageRequestSignal?.aborted).toBe(true);
  });

  it('이미지 응답이 비정상 상태면 공개 준비 완료로 간주하지 않는다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: { get: () => 'text/html' },
        body: { cancel: jest.fn().mockResolvedValue(undefined) },
      });

    await expect(probeGuestData('data-json-file-id')).resolves.toMatchObject({
      ok: false,
      status: 403,
      reason: 'thumbnail_http_not_ok',
    });
  });

  it('이미지 URL이 HTML을 반환하면 공개 준비 완료로 간주하지 않는다', async () => {
    const cancel = jest.fn().mockResolvedValue(undefined);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html; charset=utf-8' },
        body: { cancel },
      });

    await expect(probeGuestData('data-json-file-id')).resolves.toMatchObject({
      ok: false,
      status: 200,
      reason: 'thumbnail_not_image',
    });
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('비 Drive 레거시 이미지 URL은 직접 fetch하지 않는다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          ...validGuestPayload,
          mainPoster: {
            ...validGuestPayload.mainPoster,
            thumbnailFileId: 'https://example.com/legacy-image.webp',
          },
        })
      ),
    });

    await expect(probeGuestData('data-json-file-id')).resolves.toEqual({
      ok: true,
      status: 200,
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
