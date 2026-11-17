/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@/app/api/drive/_lib/driveAccess', () => ({
  assertInvitationAccess: jest.fn(),
  assertSameOriginRequest: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/ensureWorkspace', () => ({
  ...jest.requireActual('@/app/api/drive/_lib/ensureWorkspace'),
  ensureWorkspace: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/ensureInvitationFolder', () => ({
  ensureInvitationFolder: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/ensureDataJsonFile', () => ({
  ensureDataJsonFile: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/ensureAssetsFolder', () => ({
  ensureAssetsFolder: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/saveJournal', () => ({
  journalKey: jest.fn(async () => 'dev:prepare'),
  withSaveLock: jest.fn(async (_key, run) => run()),
  writeJournal: jest.fn(),
  readJournal: jest.fn(async () => null),
  JOURNAL_SECONDS: 604800,
}));

import { AuthStorageError } from '@/app/api/auth/_lib/authStorage';
import { SessionRequiredError } from '@/app/api/auth/_lib/serverSession';
import { assertInvitationAccess } from '@/app/api/drive/_lib/driveAccess';
import { ensureAssetsFolder } from '@/app/api/drive/_lib/ensureAssetsFolder';
import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { ensureInvitationFolder } from '@/app/api/drive/_lib/ensureInvitationFolder';
import { ensureWorkspace } from '@/app/api/drive/_lib/ensureWorkspace';
import { preparedFixture } from '@/app/api/drive/_lib/fixtures/security';
import { journalKey } from '@/app/api/drive/_lib/saveJournal';

import { POST } from './route';

const request = () =>
  new Request('https://invia.test/api/drive/saveInvitation', {
    method: 'POST',
    body: JSON.stringify({ invitationUuid: preparedFixture.invitationUuid }),
  });
describe('저장 준비', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(journalKey).mockResolvedValue('dev:prepare');
    jest
      .mocked(ensureWorkspace)
      .mockResolvedValue({ folderId: 'workspace', reused: true });
    jest
      .mocked(ensureInvitationFolder)
      .mockResolvedValue({
        invitationFolderId: 'invitation',
        invitationUuid: 'uuid',
        reused: true,
      });
    jest
      .mocked(ensureDataJsonFile)
      .mockResolvedValue({ dataJsonFileId: 'data', reused: true });
    jest
      .mocked(ensureAssetsFolder)
      .mockResolvedValue({
        imageFolderId: 'images',
        audioFolderId: 'audios',
        meta: { imageReused: true, audioReused: true },
      });
  });
  it('리소스를 준비하되 Google 토큰을 응답에 포함하지 않는다', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(preparedFixture);
    expect(assertInvitationAccess).toHaveBeenCalledWith('invitation');
  });
  it('로그인과 저장소 장애를 구분하고 Drive에 쓰지 않는다', async () => {
    jest.mocked(journalKey).mockRejectedValueOnce(new SessionRequiredError());
    expect((await POST(request())).status).toBe(401);
    jest.mocked(journalKey).mockRejectedValueOnce(new AuthStorageError());
    expect((await POST(request())).status).toBe(503);
    expect(ensureWorkspace).not.toHaveBeenCalled();
  });
  it('요청 재시도에서도 같은 초대장 식별자를 사용한다', async () => {
    await POST(request());
    await POST(request());
    expect(ensureInvitationFolder).toHaveBeenNthCalledWith(2, {
      workspaceFolderId: 'workspace',
      invitationUuid: 'uuid',
    });
  });
});
