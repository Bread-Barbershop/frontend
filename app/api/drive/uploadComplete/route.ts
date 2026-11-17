import { NextResponse } from 'next/server';

import {
  assertManagedFileAccess,
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
    const { file } = await assertManagedFileAccess(entry.fileId);
    const response = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${entry.fileId}?fields=size,mimeType,parents,appProperties`
    );
    const metadata = await response.json();
    if (
      !response.ok ||
      Number(metadata.size) !== entry.size ||
      metadata.mimeType !== entry.mimeType ||
      !metadata.parents?.includes(entry.folderId) ||
      file.appProperties?.upload_key !== uploadId
    ) {
      throw new DriveHttpError(
        '파일 업로드 완료를 확인하지 못했습니다.',
        409,
        {}
      );
    }
    await writeJournal(
      key,
      { ...entry, uploadUrl: undefined, complete: true },
      JOURNAL_SECONDS
    );
    return NextResponse.json(
      { fileId: entry.fileId, name: entry.name },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return driveErrorResponse(error);
  }
}
