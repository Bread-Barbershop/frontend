/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import {
  buildInvitationFolderName,
  createInvitationFolder,
  ensureInvitationFolder,
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

  it('하객 그룹 UUID는 새 초대장 대신 같은 작업공간의 하위 폴더를 재사용한다', async () => {
    const mimeType = 'application/vnd.google-apps.folder';
    jest
      .mocked(googleFetch)
      .mockResolvedValueOnce(
        Response.json({
          files: [
            {
              id: 'group-folder',
              mimeType,
              parents: ['root-folder'],
              appProperties: {
                app_id: 'Bread-Barbershop',
                kind: 'invitation_audience',
                audience_root: 'root-folder',
                audience_name: '가족',
                audience_slug: 'family',
                inv_id: 'aud_example',
              },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          id: 'root-folder',
          mimeType,
          ownedByMe: true,
          parents: ['my-workspace'],
          appProperties: { app_id: 'Bread-Barbershop', kind: 'invitation' },
        })
      );

    await expect(
      ensureInvitationFolder({
        workspaceFolderId: 'my-workspace',
        invitationUuid: 'aud_example',
      })
    ).resolves.toEqual({
      invitationFolderId: 'group-folder',
      invitationUuid: 'aud_example',
      reused: true,
      audienceSlug: 'family',
    });
    expect(
      jest.mocked(googleFetch).mock.calls.every(([, init]) => !init?.method)
    ).toBe(true);
  });

  it('삭제된 하객 그룹을 저장해도 대시보드에 새 초대장을 만들지 않는다', async () => {
    jest
      .mocked(googleFetch)
      .mockResolvedValueOnce(Response.json({ files: [] }));

    await expect(
      ensureInvitationFolder({
        workspaceFolderId: 'my-workspace',
        invitationUuid: 'aud_deleted',
      })
    ).rejects.toMatchObject({ status: 404 });
    expect(googleFetch).toHaveBeenCalledTimes(1);
  });
});
