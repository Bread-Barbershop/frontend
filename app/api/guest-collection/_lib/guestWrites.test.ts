/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('./store', () => ({
  getCollection: jest.fn(),
  guestGoogle: jest.fn(),
}));
import { appendMessage, submitGuest } from './guestWrites';
import { getCollection, guestGoogle } from './store';

describe('하객 접수', () => {
  it('서로 다른 글은 각각 추가하고 응답 유실 후 같은 글을 다시 보내도 한 행만 남긴다', async () => {
    const seen = new Map<
      number,
      { metadataKey: string; metadataValue: string }
    >();
    const rows: string[] = [];
    const google: typeof fetch = async (url, init) => {
      if (!init)
        return Response.json(seen.get(Number(String(url).split('/').pop())));
      const { requests } = JSON.parse(String(init.body));
      const receipt = requests[0].createDeveloperMetadata.developerMetadata;
      if (seen.has(receipt.metadataId))
        return new Response(null, { status: 400 });
      seen.set(receipt.metadataId, receipt);
      rows.push(
        requests[1].appendCells.rows[0].values[1].userEnteredValue.stringValue
      );
      return Response.json({});
    };
    const add = (id: string, msg: string) =>
      appendMessage('sheet', 0, id, '하객', msg, google);
    await Promise.all([add('first', '=축하해요'), add('second', '행복하세요')]);
    await add('first', '=축하해요');
    expect(rows).toEqual(['=축하해요', '행복하세요']);
  });
  it('D+4에는 Google 자격 증명에 접근하기 전에 두 종류의 쓰기를 거절한다', async () => {
    jest.mocked(getCollection).mockResolvedValue({
      guestbook: true,
      photos: true,
      closesAt: Date.now() - 1,
    } as never);
    for (const kind of ['message', 'photo'])
      await expect(
        submitGuest(new Request('https://invia.test'), 'id', { kind })
      ).rejects.toMatchObject({ status: 410 });
    expect(guestGoogle).not.toHaveBeenCalled();
  });
});
