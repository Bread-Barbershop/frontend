import { NextResponse } from 'next/server';

import {
  assertInvitationAccess,
  assertSameOriginRequest,
  readManagedDriveMetadata,
} from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { ensureAssetsFolder } from '@/app/api/drive/_lib/ensureAssetsFolder';
import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { ensureInvitationFolder } from '@/app/api/drive/_lib/ensureInvitationFolder';
import {
  ensureWorkspace,
  DriveHttpError,
} from '@/app/api/drive/_lib/ensureWorkspace';
import {
  journalKey,
  JOURNAL_SECONDS,
  readJournal,
  withSaveLock,
  writeJournal,
} from '@/app/api/drive/_lib/saveJournal';
import type { PreparedInvitationSave } from '@/features/invitation/save/prepareCache';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest(request);
    const { invitationUuid } = await request.json();
    if (
      typeof invitationUuid !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,100}$/.test(invitationUuid)
    )
      throw new DriveHttpError('안정적인 초대장 ID가 필요합니다.', 400, {});
    // Serialize all prepares for an account, including first-time workspace creation.
    const lockKey = await journalKey('prepare', 'workspace');
    return await withSaveLock(lockKey, async () => {
      const saveKey = await journalKey('save', invitationUuid);
      const cached = await readJournal<PreparedInvitationSave>(saveKey);
      if (
        cached?.invitationFolderId &&
        cached.dataJsonFileId &&
        cached.imageFolderId &&
        cached.audioFolderId
      ) {
        try {
          await assertInvitationAccess(cached.invitationFolderId);
          const expected = [
            [cached.dataJsonFileId, 'invitation_data_json'],
            [cached.imageFolderId, 'assets_images'],
            [cached.audioFolderId, 'assets_audios'],
          ];
          for (const [id, kind] of expected) {
            const file = await readManagedDriveMetadata(id);
            if (
              !file.parents?.includes(cached.invitationFolderId) ||
              file.appProperties?.kind !== kind
            )
              throw new DriveHttpError('저장 대상이 변경됐습니다.', 403, {});
          }
          const {
            workspaceFolderId,
            invitationFolderId,
            dataJsonFileId,
            imageFolderId,
            audioFolderId,
          } = cached;
          return NextResponse.json(
            {
              workspaceFolderId,
              invitationFolderId,
              dataJsonFileId,
              imageFolderId,
              audioFolderId,
              invitationUuid,
              ...(cached.audienceSlug
                ? { audienceSlug: cached.audienceSlug }
                : {}),
            },
            { headers: { 'Cache-Control': 'no-store' } }
          );
        } catch (error) {
          if (
            !(error instanceof DriveHttpError) ||
            ![403, 404].includes(error.status)
          )
            throw error;
        }
      }
      const workspace = await ensureWorkspace();
      const invitation = await ensureInvitationFolder({
        workspaceFolderId: workspace.folderId,
        invitationUuid,
      });
      await assertInvitationAccess(invitation.invitationFolderId);
      const data = await ensureDataJsonFile(invitation.invitationFolderId);
      const assets = await ensureAssetsFolder(invitation.invitationFolderId);
      const result = {
        workspaceFolderId: workspace.folderId,
        invitationFolderId: invitation.invitationFolderId,
        invitationUuid,
        ...(invitation.audienceSlug
          ? { audienceSlug: invitation.audienceSlug }
          : {}),
        dataJsonFileId: data.dataJsonFileId,
        imageFolderId: assets.imageFolderId,
        audioFolderId: assets.audioFolderId,
      };
      await writeJournal(
        await journalKey('save', invitationUuid),
        { ...result, stage: 'prepared', updatedAt: Date.now() },
        JOURNAL_SECONDS
      );
      return NextResponse.json(result, {
        headers: { 'Cache-Control': 'no-store' },
      });
    });
  } catch (error) {
    return driveErrorResponse(error);
  }
}
