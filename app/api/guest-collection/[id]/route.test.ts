/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('../_lib/store', () => ({
  getCollection: jest.fn(),
  hasGrant: jest.fn(),
}));
jest.mock('@/app/guest/[id]/server/loadGuestPayload', () => ({
  loadGuestPayload: jest.fn(async () => ({ status: 'ok' })),
}));
import { getCollection, hasGrant } from '../_lib/store';
import { GET } from './route';
it('마감 뒤에는 Google 토큰 없이 공개 방명록의 줄바꿈과 쉼표를 읽는다', async () => {
  const old = global.fetch;
  try {
    jest
      .mocked(getCollection)
      .mockResolvedValue({
        sheet: 'sheet',
        tabId: 0,
        guestbook: true,
        photos: false,
        closesAt: 0,
      } as never);
    global.fetch = jest.fn(
      async () =>
        new Response('"이름","축하해, 친구야!\n행복해","2027-01-01"', {
          headers: { 'Content-Type': 'text/csv; charset=utf-8' },
        })
    );
    const response = await GET(new Request('https://invia.test/'), {
      params: Promise.resolve({ id: 'data' }),
    });
    expect((await response.json()).entries).toEqual([
      ['이름', '축하해, 친구야!\n행복해', '2027-01-01'],
    ]);
    expect(hasGrant).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ credentials: 'omit' })
    );
  } finally {
    global.fetch = old;
  }
});
