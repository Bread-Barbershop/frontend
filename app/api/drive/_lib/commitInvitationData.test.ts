/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('./driveAccess', () => ({ assertManagedFileAccess: jest.fn() }));
jest.mock('./googleFetch', () => ({ googleFetch: jest.fn() }));
jest.mock('./saveJournal', () => ({ markSaveStage: jest.fn() }));

import { commitInvitationData, readUploadedJson } from './commitInvitationData';
import { assertManagedFileAccess } from './driveAccess';
import {
  dataJsonAccessFixture,
  invitationPayloadFixture,
} from './fixtures/uploads';
import { googleFetch } from './googleFetch';

describe('초대장 본문 반영', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(assertManagedFileAccess)
      .mockResolvedValue(dataJsonAccessFixture as never);
    jest.mocked(googleFetch).mockResolvedValue(Response.json({}));
  });
  it('작은 JSON과 직접 전송한 JSON 모두 실행 코드를 제거한 뒤 저장한다', async () => {
    await commitInvitationData(
      'canonical-data',
      invitationPayloadFixture,
      'invitation'
    );
    const serialized = jest.mocked(googleFetch).mock.calls[0][1]
      ?.body as string;
    expect(serialized).not.toContain('onerror');
    expect(serialized).not.toContain('<img');
    expect(serialized).toContain('초대합니다');
    expect(assertManagedFileAccess).toHaveBeenCalledWith(
      'canonical-data',
      'invitation'
    );
  });
  it('일반 이미지 파일을 초대장 본문으로 덮어쓰지 않는다', async () => {
    jest
      .mocked(assertManagedFileAccess)
      .mockResolvedValue({
        ...dataJsonAccessFixture,
        file: { ...dataJsonAccessFixture.file, mimeType: 'image/jpeg' },
      } as never);
    await expect(
      commitInvitationData('canonical-data', invitationPayloadFixture)
    ).rejects.toMatchObject({ status: 403 });
    expect(googleFetch).not.toHaveBeenCalled();
  });
  it('깨진 임시 JSON은 본문에 반영하지 않는다', async () => {
    await expect(
      readUploadedJson(new Response('broken-json'))
    ).rejects.toMatchObject({ status: 400 });
    expect(googleFetch).not.toHaveBeenCalled();
  });
});
