/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('./store', () => ({
  getCollection: jest.fn(),
  guestGoogle: jest.fn(),
}));
jest.mock('@/app/api/auth/_lib/authStorage', () => ({
  authKey: (value: string) => value,
  authRedis: () => ({ redis: { eval: async () => 1 } }),
}));
import { getCollection, guestGoogle } from './store';
import { submitGuest } from './guestWrites';

const url = 'https://www.googleapis.com/upload/drive/v3/files?upload_id=sample';
describe('비공개 하객 사진함', () => {
  beforeEach(() => {
    jest.mocked(getCollection).mockResolvedValue({
      photos: true,
      root: 'invitation',
      photoFolder: 'private-folder',
      closesAt: Date.now() + 60000,
    } as never);
  });
  it.each([false, true])(
    '사진함에 다른 열람자가 있는 경우 %s',
    async shared => {
      const uploader = jest.fn(async (input: Parameters<typeof fetch>[0]) => {
        if (String(input).includes('/upload/'))
          return new Response(null, { headers: { location: url } });
        const folder = String(input).includes('/private-folder');
        const permissions =
          folder && !shared
            ? [{ type: 'user', role: 'owner' }]
            : [{ type: 'anyone', role: 'reader' }];
        return Response.json({ ownedByMe: true, permissions });
      });
      jest.mocked(guestGoogle).mockResolvedValue(uploader);
      const answer = submitGuest(
        new Request('https://invia.test'),
        'root-data',
        {
          kind: 'photo',
          mimeType: 'image/jpeg',
          size: 1000,
          folder: 'untrusted',
        }
      );
      if (shared) {
        await expect(answer).rejects.toMatchObject({ status: 403 });
        expect(uploader).toHaveBeenCalledTimes(2);
      } else {
        await expect(answer).resolves.toEqual({ uploadUrl: url });
        expect(uploader).toHaveBeenLastCalledWith(
          expect.stringContaining('/upload/'),
          expect.objectContaining({
            body: expect.stringContaining('"parents":["private-folder"]'),
          })
        );
      }
    }
  );
});
