/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@/app/api/drive/_lib/driveAccess', () => ({ assertSameOriginRequest: jest.fn(), assertDriveId: jest.fn(), assertAssetFolderAccess: jest.fn(), assertManagedFileAccess: jest.fn() }));
jest.mock('@/app/api/drive/_lib/googleFetch', () => ({ googleFetch: jest.fn() }));
jest.mock('@/app/api/drive/_lib/saveJournal', () => ({ journalKey: jest.fn(async () => 'dev:user:upload'), readJournal: jest.fn(), writeJournal: jest.fn(), JOURNAL_SECONDS: 604800, withSaveLock: jest.fn(async (_key, run) => run()) }));

import { assertAssetFolderAccess } from '@/app/api/drive/_lib/driveAccess';
import { uploadJournalFixture, uploadRequestFixture, uploadUrlFixture } from '@/app/api/drive/_lib/fixtures/uploads';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { readJournal, writeJournal } from '@/app/api/drive/_lib/saveJournal';

import { POST } from './route';

const request = () => new Request('https://invia.test/api/drive/uploadSession', { method: 'POST', body: JSON.stringify(uploadRequestFixture) });
describe('한정된 Drive 업로드 연결', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(assertAssetFolderAccess).mockResolvedValue({ file: { appProperties: { kind: 'assets_images' } } } as never);
    jest.mocked(readJournal).mockResolvedValue(null);
    const journal = jest.requireMock('@/app/api/drive/_lib/saveJournal');
    journal.journalKey.mockResolvedValue('dev:user:upload');
    journal.withSaveLock.mockImplementation(async (_key: string, run: () => Promise<unknown>) => run());
    jest.mocked(googleFetch).mockImplementation(async url => url.includes('generateIds') ? Response.json({ ids: ['allocated-file'] }) : new Response(null, { status: 200, headers: { Location: uploadUrlFixture } }));
  });
  it('고정 파일 ID를 먼저 기록하고 OAuth 토큰 없이 임시 URI만 반환한다', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.uploadUrl).toBe(uploadUrlFixture);
    expect(result).not.toHaveProperty('accessToken');
    expect(writeJournal).toHaveBeenNthCalledWith(1, 'dev:user:upload', expect.objectContaining({ fileId: 'allocated-file', folderId: 'images' }), 604800);
    const init = jest.mocked(googleFetch).mock.calls[1][1];
    expect(JSON.parse(init?.body as string).parents).toEqual(['images']);
  });
  it('응답 유실로 재요청해도 기록된 업로드 URI를 재사용한다', async () => {
    jest.mocked(readJournal).mockResolvedValue({ ...uploadJournalFixture, createdAt: Date.now(), uploadUrl: uploadUrlFixture });
    expect((await POST(request())).status).toBe(200);
    expect(googleFetch).not.toHaveBeenCalled();
  });
  it('다른 종류의 에셋 폴더에는 파일을 생성하지 않는다', async () => {
    jest.mocked(assertAssetFolderAccess).mockResolvedValue({ file: { appProperties: { kind: 'assets_audios' } } } as never);
    expect((await POST(request())).status).toBe(403);
    expect(googleFetch).not.toHaveBeenCalled();
  });
});
