/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/guestReadiness', () => ({
  guestPath: (dataJsonFileId: string) => `/guest/${dataJsonFileId}`,
  probeGuestData: jest.fn(),
}));

import { GET } from '@/app/api/drive/guestReadiness/route';
import { probeGuestData } from '@/app/api/drive/_lib/guestReadiness';

describe('guestReadiness route', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('dataJsonFileId가 없으면 400을 반환한다', async () => {
    const res = await GET(
      new Request('http://localhost/api/drive/guestReadiness')
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      ok: false,
      error: 'dataJsonFileId required',
    });
  });

  it('게스트 data.json을 읽을 수 있으면 ready=true를 반환한다', async () => {
    (probeGuestData as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    const res = await GET(
      new Request(
        'http://localhost/api/drive/guestReadiness?dataJsonFileId=data-json-file-id'
      )
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: true,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
      details: { ok: true, status: 200 },
    });
  });

  it('게스트 data.json이 아직 준비되지 않았으면 202와 ready=false를 반환한다', async () => {
    (probeGuestData as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      reason: 'http_not_ok',
    });

    const res = await GET(
      new Request(
        'http://localhost/api/drive/guestReadiness?dataJsonFileId=data-json-file-id'
      )
    );
    const json = await res.json();

    expect(res.status).toBe(202);
    expect(json).toEqual({
      ok: true,
      published: true,
      ready: false,
      guestUrl: '/guest/data-json-file-id',
      dataJsonFileId: 'data-json-file-id',
      warning: 'guest_not_ready',
      status: 202,
      details: {
        ok: false,
        status: 404,
        reason: 'http_not_ok',
      },
    });
  });
});
