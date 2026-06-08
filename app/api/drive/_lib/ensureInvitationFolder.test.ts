/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import {
  buildInvitationFolderName,
  createInvitationFolder,
} from '@/app/api/drive/_lib/ensureInvitationFolder';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

describe('ensureInvitationFolder helpers', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('생성 시각을 초대장 폴더명에 포함한다', () => {
    const name = buildInvitationFolderName({
      createdAt: new Date('2026-06-06T05:07:00.000Z'),
    });

    expect(name).toBe('초대장 - 2026년 06월 06일 14시 07분');
  });

  it('추후 사용자 지정 초대장 이름을 기준명으로 사용할 수 있다', () => {
    const name = buildInvitationFolderName({
      baseName: '민지와 준호',
      createdAt: new Date('2026-06-06T05:07:00.000Z'),
    });

    expect(name).toBe('민지와 준호 - 2026년 06월 06일 14시 07분');
  });

  it('신규 Drive 초대장 폴더 생성 요청에 생성 시각 기반 이름을 사용한다', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-06T05:07:00.000Z'));
    (googleFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'created-folder-id' }),
    });

    await createInvitationFolder({
      workspaceFolderId: 'workspace-folder-id',
      invitationUuid: 'invitation-uuid',
    });

    const [, requestInit] = (googleFetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(requestInit.body);

    expect(body.name).toBe('초대장 - 2026년 06월 06일 14시 07분');
  });
});
