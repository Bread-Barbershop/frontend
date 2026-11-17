/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('@/app/api/drive/_lib/commitInvitationData', () => ({
  ...jest.requireActual('@/app/api/drive/_lib/commitInvitationData'),
  assertDataJsonAccess: jest.fn(),
  commitInvitationData: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/driveAccess', () => ({
  assertSameOriginRequest: jest.fn(),
  assertManagedFileAccess: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/saveJournal', () => ({
  journalKey: jest.fn(async () => 'dev:user:upload'),
  readJournal: jest.fn(),
  writeJournal: jest.fn(),
  JOURNAL_SECONDS: 604800,
}));

import {
  assertDataJsonAccess,
  commitInvitationData,
} from '@/app/api/drive/_lib/commitInvitationData';
import { assertManagedFileAccess } from '@/app/api/drive/_lib/driveAccess';
import {
  invitationPayloadFixture,
  dataJsonAccessFixture,
  uploadIdFixture,
  uploadJournalFixture,
} from '@/app/api/drive/_lib/fixtures/uploads';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { readJournal, writeJournal } from '@/app/api/drive/_lib/saveJournal';

import { POST } from './route';

const request = () =>
  new Request('https://invia.test/api/drive/uploadComplete', {
    method: 'POST',
    body: JSON.stringify({
      uploadId: uploadIdFixture,
      fileId: 'attacker-selected-id',
    }),
  });
describe('업로드 완료 확인', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(readJournal).mockResolvedValue(uploadJournalFixture);
    jest.mocked(assertManagedFileAccess).mockResolvedValue({
      file: { appProperties: { upload_key: uploadIdFixture } },
    } as never);
    jest.mocked(googleFetch).mockResolvedValue(
      Response.json({
        size: 1234,
        mimeType: 'image/jpeg',
        parents: ['images'],
      })
    );
  });
  it('클라이언트가 준 파일 ID를 무시하고 서버 기록의 파일을 검증한다', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      fileId: 'allocated-file',
      name: 'wedding.jpg',
    });
    expect(assertManagedFileAccess).toHaveBeenCalledWith(
      'allocated-file',
      undefined
    );
  });
  it('파일 크기나 소속이 다르면 완료로 처리하지 않는다', async () => {
    jest.mocked(googleFetch).mockResolvedValue(
      Response.json({
        size: 12,
        mimeType: 'image/jpeg',
        parents: ['other-folder'],
      })
    );
    expect((await POST(request())).status).toBe(409);
    expect(writeJournal).not.toHaveBeenCalled();
  });
  it('사용자에게 속한 업로드 기록이 없으면 거절한다', async () => {
    jest.mocked(readJournal).mockResolvedValue(null);
    expect((await POST(request())).status).toBe(410);
    expect(googleFetch).not.toHaveBeenCalled();
  });
  it('큰 JSON은 임시 파일을 읽고 서버 검증 경로로 본문에 반영한다', async () => {
    jest
      .mocked(readJournal)
      .mockResolvedValue({
        ...uploadJournalFixture,
        folderId: 'invitation',
        mimeType: 'application/json',
        dataJsonFileId: 'canonical-data',
      });
    jest
      .mocked(assertManagedFileAccess)
      .mockResolvedValue({
        file: {
          appProperties: {
            upload_key: uploadIdFixture,
            kind: 'invitation_staging_json',
          },
        },
      } as never);
    jest
      .mocked(googleFetch)
      .mockReset()
      .mockResolvedValueOnce(
        Response.json({
          size: 1234,
          mimeType: 'application/json',
          parents: ['invitation'],
        })
      )
      .mockResolvedValueOnce(Response.json(invitationPayloadFixture))
      .mockResolvedValue(new Response(null, { status: 204 }));
    jest
      .mocked(commitInvitationData)
      .mockResolvedValue({ fileId: 'canonical-data', name: 'data.json' });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(commitInvitationData).toHaveBeenCalledWith(
      'canonical-data',
      invitationPayloadFixture,
      'invitation'
    );
    expect(await response.json()).toEqual({
      fileId: 'canonical-data',
      name: 'data.json',
    });
  });
  it('본문 반영 응답이 유실돼도 완료 기록으로 재전송 없이 복구한다', async () => {
    jest
      .mocked(readJournal)
      .mockResolvedValue({
        ...uploadJournalFixture,
        folderId: 'invitation',
        dataJsonFileId: 'canonical-data',
        complete: true,
      });
    jest
      .mocked(assertDataJsonAccess)
      .mockResolvedValue(dataJsonAccessFixture as never);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(commitInvitationData).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      fileId: 'canonical-data',
      name: 'data.json',
    });
  });
});
