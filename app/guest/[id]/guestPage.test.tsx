/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/guest/[id]/page.tsx 의 GuestPage 서버 컴포넌트를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 공개 데이터 fetch 성공 + 유효한 payload이면 정상 렌더링되는지
 * 2) fetch 실패(res.ok === false) 시 notFound()가 호출되는지
 * 3) JSON 파싱 실패 시 notFound()가 호출되는지
 * 4) payload 구조가 잘못되면 notFound()가 호출되는지
 *
 * 추가 참고:
 * - fetch 자체가 reject 되는 경우는 현재 구현에서 catch 하지 않으므로
 *   notFound()가 아니라 그대로 reject 전파가 된다.
 * - 이 테스트 파일은 현재 구현된 명세를 기준으로 작성한다.
 *
 * 중요한 포인트:
 * - 실제 Google Drive 공개 URL을 호출하지 않는다.
 * - global.fetch를 mock해서 응답 상황을 직접 만든다.
 * - 페이지 내부에서 사용하는 하위 컴포넌트들도 mock 처리해서
 *   "GuestPage가 어떤 분기와 어떤 props로 동작하는지"에만 집중한다.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import GuestPage from '@/app/guest/[id]/page';

// ------------------------------
// next/navigation의 notFound를 mock 처리
// 실제 Next.js notFound 동작 대신,
// 우리가 추적 가능한 에러를 던지도록 만든다.
// ------------------------------
const notFoundMock = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

jest.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

// ------------------------------
// 하위 컴포넌트 mock
// GuestPage의 핵심은 "데이터를 받아 어떤 분기를 타느냐" 이므로,
// 하위 UI 자체는 단순 더미 컴포넌트로 대체한다.
// ------------------------------
const guestMainPosterMock = jest.fn((props: { json: unknown }) => {
  return React.createElement(
    'div',
    { 'data-testid': 'guest-main-poster' },
    JSON.stringify(props.json)
  );
});

const guestRendererMock = jest.fn(
  (props: { blocks: unknown; bulkData: unknown }) => {
    return React.createElement(
      'div',
      { 'data-testid': 'guest-renderer' },
      JSON.stringify(props.blocks)
    );
  }
);

const guestBgmMock = jest.fn((props: { bgm: unknown }) => {
  return React.createElement(
    'div',
    { 'data-testid': 'guest-bgm' },
    JSON.stringify(props.bgm)
  );
});

jest.mock('@/app/guest/[id]/components/GuestMainPoster', () => ({
  GuestMainPoster: (props: { json: unknown }) => guestMainPosterMock(props),
}));

jest.mock('@/app/guest/[id]/components/GuestRenderer', () => ({
  __esModule: true,
  default: (props: { blocks: unknown; bulkData: unknown }) =>
    guestRendererMock(props),
}));

jest.mock('@/app/guest/[id]/components/GuestBgm', () => ({
  __esModule: true,
  default: (props: { bgm: unknown }) => guestBgmMock(props),
}));

// ------------------------------
// fetch mock
// GuestPage는 서버 컴포넌트 내부에서 fetch를 사용하므로
// global.fetch를 mock 처리한다.
// ------------------------------
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// ------------------------------
// 정상 payload 샘플
// GuestPage의 타입 가드(isGuestPayload)를 통과할 수 있도록
// 최소 필드를 맞춰서 구성한다.
// ------------------------------
const validGuestPayload = {
  mainPoster: {
    version: '1.0.0',
    objects: [],
    background: '#ffffff',
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
      color: '#000000',
      bold: false,
      italic: false,
      align: 'center',
      isDefault: false,
    },
    isZoom: false,
  },
};

describe('GuestPage 서버 컴포넌트 테스트', () => {
  beforeEach(() => {
    /**
     * clearAllMocks를 사용하는 이유:
     * - 호출 횟수 / 호출 인자 기록은 지우되
     * - notFoundMock, 하위 컴포넌트 mock의 "구현"은 유지하기 위해서다.
     *
     * 여기서 resetAllMocks를 사용하면
     * notFoundMock의 throw 동작과
     * 하위 컴포넌트 mock의 렌더링 구현까지 사라질 수 있다.
     */
    jest.clearAllMocks();

    /**
     * fetch는 각 테스트마다 응답 상황을 다르게 설정해야 하므로
     * 구현까지 깨끗하게 초기화한다.
     */
    mockFetch.mockReset();

    /**
     * global.fetch를 다시 연결한다.
     */
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('fetch 성공 + 유효한 payload면 정상 렌더링한다', async () => {
    /**
     * 목적:
     * 공개 guest 데이터가 정상적으로 로드되고,
     * payload 구조도 올바른 경우 GuestPage가 정상 렌더링되는지 확인한다.
     */

    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(validGuestPayload)),
    });

    const pageElement = await GuestPage({
      params: Promise.resolve({ id: 'guest-file-id-123' }),
    });

    /**
     * 서버 컴포넌트가 반환한 JSX를 HTML 문자열로 렌더링한다.
     * 여기서는 "렌더링 가능한지"와
     * "하위 mock 컴포넌트가 실제로 호출되었는지"를 확인한다.
     */
    const html = renderToStaticMarkup(pageElement);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://drive.google.com/uc?export=download&id=guest-file-id-123',
      {
        next: { tags: ['invitation:guest-file-id-123'] },
      }
    );

    expect(notFoundMock).not.toHaveBeenCalled();

    expect(guestMainPosterMock).toHaveBeenCalledWith({
      json: validGuestPayload.mainPoster,
    });

    expect(guestRendererMock).toHaveBeenCalledWith({
      blocks: validGuestPayload.blocks,
      bulkData: validGuestPayload.bulkData,
    });

    expect(guestBgmMock).toHaveBeenCalledWith({
      bgm: validGuestPayload.bgm,
    });

    expect(html).toContain('data-testid="guest-main-poster"');
    expect(html).toContain('data-testid="guest-renderer"');
    expect(html).toContain('data-testid="guest-bgm"');
    expect(html).toContain('max-w-[430px]');
    expect(html).toContain('max-w-[375px]');
  });

  it('fetch 실패(res.ok === false)면 notFound()를 호출한다', async () => {
    /**
     * 목적:
     * 공개 데이터 요청은 성공적으로 반환되었지만,
     * HTTP 레벨에서 ok가 false인 경우 GuestPage가 즉시 notFound()로 빠지는지 확인한다.
     */

    mockFetch.mockResolvedValue({
      ok: false,
      text: jest.fn(),
    });

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'missing-file-id' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);

    // fetch 실패이므로 하위 렌더러는 호출되면 안 된다.
    expect(guestMainPosterMock).not.toHaveBeenCalled();
    expect(guestRendererMock).not.toHaveBeenCalled();
    expect(guestBgmMock).not.toHaveBeenCalled();
  });

  it('JSON 파싱에 실패하면 notFound()를 호출한다', async () => {
    /**
     * 목적:
     * 응답은 성공했지만 body가 깨진 JSON일 때,
     * GuestPage가 안전하게 notFound() 처리하는지 확인한다.
     */

    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('{ this is not valid json }'),
    });

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'broken-json-file-id' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);

    expect(guestMainPosterMock).not.toHaveBeenCalled();
    expect(guestRendererMock).not.toHaveBeenCalled();
    expect(guestBgmMock).not.toHaveBeenCalled();
  });

  it('payload 구조가 잘못되면 notFound()를 호출한다', async () => {
    /**
     * 목적:
     * JSON 파싱은 성공했지만 GuestPage가 기대하는 payload 구조가 아니면
     * notFound()로 빠지는지 확인한다.
     *
     * 여기서는 bgm 구조를 일부러 틀리게 만들어 타입 가드를 통과하지 못하게 한다.
     */
    const invalidPayload = {
      mainPoster: {
        version: '1.0.0',
        objects: [],
      },
      blocks: [],
      bgm: {
        // isLoop가 빠져 있으므로 invalid payload
        selectedBgmId: null,
        volume: 0.2,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(invalidPayload)),
    });

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'invalid-payload-file-id' }),
      })
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFoundMock).toHaveBeenCalledTimes(1);

    expect(guestMainPosterMock).not.toHaveBeenCalled();
    expect(guestRendererMock).not.toHaveBeenCalled();
    expect(guestBgmMock).not.toHaveBeenCalled();
  });

  it('fetch 자체가 reject 되면 현재 구현상 에러가 그대로 전파된다', async () => {
    /**
     * 목적:
     * 네트워크 에러처럼 fetch 자체가 reject 되는 경우,
     * 현재 GuestPage 구현은 이를 catch 하지 않으므로
     * notFound()가 아니라 원래 에러가 그대로 전파되는지를 확인한다.
     *
     * 이 테스트는 "현재 구현의 명세 고정" 용도다.
     * 만약 추후 정책이 "네트워크 에러도 notFound 처리"로 바뀐다면
     * 이 테스트 그때 수정해야 한다.
     */
    mockFetch.mockRejectedValue(new Error('network error'));

    await expect(
      GuestPage({
        params: Promise.resolve({ id: 'network-error-file-id' }),
      })
    ).rejects.toThrow('network error');

    expect(notFoundMock).not.toHaveBeenCalled();

    expect(guestMainPosterMock).not.toHaveBeenCalled();
    expect(guestRendererMock).not.toHaveBeenCalled();
    expect(guestBgmMock).not.toHaveBeenCalled();
  });
});
