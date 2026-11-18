import { NextResponse } from 'next/server';

import {
  assertDataJsonAccess,
  commitInvitationData,
  readUploadedJson,
} from '@/app/api/drive/_lib/commitInvitationData';
import {
  assertManagedFileAccess,
  readManagedDriveMetadata,
  assertSameOriginRequest,
} from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import {
  journalKey,
  JOURNAL_SECONDS,
  readJournal,
  writeJournal,
} from '@/app/api/drive/_lib/saveJournal';

import type { UploadJournal } from '../uploadSession/route';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest(request);
    const { uploadId } = await request.json();
    if (typeof uploadId !== 'string' || !/^[a-f0-9]{64}$/.test(uploadId))
      throw new DriveHttpError('잘못된 업로드 정보입니다.', 400, {});
    const key = await journalKey('upload', uploadId);
    const entry = await readJournal<UploadJournal>(key);
    if (!entry)
      throw new DriveHttpError('업로드 준비 정보가 만료됐습니다.', 410, {});
    if (entry.complete && entry.dataJsonFileId) {
      const { file } = await assertDataJsonAccess(
        entry.dataJsonFileId,
        entry.folderId
      );
      await cleanupStagingFile(entry, uploadId);
      return NextResponse.json(
        { fileId: file.id, name: file.name },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
    const file = entry.dataJsonFileId
      ? await readManagedDriveMetadata(entry.fileId)
      : (await assertManagedFileAccess(entry.fileId, undefined)).file;
    const response = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${entry.fileId}?fields=size,mimeType,parents,appProperties`
    );
    const metadata = await response.json();
    if (
      !response.ok ||
      Number(metadata.size) !== entry.size ||
      metadata.mimeType !== entry.mimeType ||
      (!entry.dataJsonFileId && !metadata.parents?.includes(entry.folderId)) ||
      file.appProperties?.upload_key !== uploadId
    ) {
      throw new DriveHttpError(
        '파일 업로드 완료를 확인하지 못했습니다.',
        409,
        {}
      );
    }
    let result = { fileId: entry.fileId, name: entry.name };
    if (entry.dataJsonFileId) {
      if (file.appProperties?.kind !== 'invitation_staging_json')
        throw new DriveHttpError('잘못된 임시 초대장 파일입니다.', 403, {});
      const uploaded = await googleFetch(
        'https://www.googleapis.com/drive/v3/files/' +
          entry.fileId +
          '?alt=media',
        { cache: 'no-store' }
      );
      const payload = await readUploadedJson(uploaded);
      result = await commitInvitationData(
        entry.dataJsonFileId,
        payload,
        entry.folderId
      );
    }
    await writeJournal(
      key,
      { ...entry, uploadUrl: undefined, complete: true },
      JOURNAL_SECONDS
    );
    if (entry.dataJsonFileId) await cleanupStagingFile(entry, uploadId);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return driveErrorResponse(error);
  }
}

async function cleanupStagingFile(entry: UploadJournal, uploadId: string) {
  try {
    const file = await readManagedDriveMetadata(entry.fileId);
    if (
      file.appProperties?.kind !== 'invitation_staging_json' ||
      file.appProperties.upload_key !== uploadId
    )
      return;
    await googleFetch(
      'https://www.googleapis.com/drive/v3/files/' + entry.fileId,
      { method: 'DELETE' }
    );
  } catch {
    /* A failed cleanup cannot invalidate an already committed invitation. */
  }
}
