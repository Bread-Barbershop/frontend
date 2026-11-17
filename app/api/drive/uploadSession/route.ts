import { NextResponse } from 'next/server';

import { sessionHash } from '@/app/api/auth/_lib/sessionCrypto';
import {
  assertAssetFolderAccess,
  assertDriveId,
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
  withSaveLock,
  writeJournal,
} from '@/app/api/drive/_lib/saveJournal';

export type UploadJournal = {
  fileId: string;
  folderId: string;
  name: string;
  mimeType: string;
  size: number;
  uploadUrl?: string;
  complete?: boolean;
  createdAt: number;
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest(request);
    const body = await request.json();
    assertDriveId(body.folderId);
    if (
      typeof body.name !== 'string' ||
      !body.name ||
      body.name.length > 255 ||
      !Number.isSafeInteger(body.size) ||
      body.size <= 0 ||
      body.size > 100 * 1024 * 1024 ||
      typeof body.digest !== 'string' ||
      !/^[a-f0-9]{64}$/.test(body.digest) ||
      typeof body.mimeType !== 'string' ||
      !/^(image\/(jpeg|png|webp|gif|avif|heic|heif)|audio\/[a-z0-9.+-]+)$/.test(
        body.mimeType
      )
    ) {
      throw new DriveHttpError(
        '지원하지 않는 파일 형식 또는 크기입니다.',
        400,
        {}
      );
    }
    const { file: folder } = await assertAssetFolderAccess(body.folderId);
    const expectedKind = body.mimeType.startsWith('image/')
      ? 'assets_images'
      : 'assets_audios';
    if (folder.appProperties?.kind !== expectedKind)
      throw new DriveHttpError('올바른 업로드 폴더가 아닙니다.', 403, {});
    const uploadId = sessionHash(
      `${body.folderId}:${body.digest}:${body.size}:${body.mimeType}`
    );
    const key = await journalKey('upload', uploadId);
    return await withSaveLock(key, async () => {
      let entry = await readJournal<UploadJournal>(key);
      if (entry?.complete) {
        await assertManagedFileAccess(entry.fileId);
        return NextResponse.json(
          { uploadId, fileId: entry.fileId, name: entry.name, complete: true },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }
      if (
        entry?.uploadUrl &&
        body.restart !== true &&
        entry.createdAt > Date.now() - 6 * 24 * 60 * 60 * 1000
      ) {
        return NextResponse.json(
          { uploadId, uploadUrl: entry.uploadUrl },
          { headers: { 'Cache-Control': 'no-store' } }
        );
      }
      if (!entry) {
        const generated = await googleFetch(
          'https://www.googleapis.com/drive/v3/files/generateIds?count=1&space=drive&type=files'
        );
        const ids = await generated.json();
        if (!generated.ok || !ids.ids?.[0])
          throw new DriveHttpError(
            '업로드 파일을 준비하지 못했습니다.',
            502,
            {}
          );
        entry = {
          fileId: ids.ids[0],
          folderId: body.folderId,
          name: body.name,
          size: body.size,
          mimeType: body.mimeType,
          createdAt: Date.now(),
        };
        // Persist the allocated ID before contacting Drive: a lost response cannot create a second file.
        await writeJournal(key, entry, JOURNAL_SECONDS);
      }
      const response = await googleFetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': entry.mimeType,
            'X-Upload-Content-Length': String(entry.size),
            Origin: new URL(request.url).origin,
          },
          body: JSON.stringify({
            id: entry.fileId,
            name: entry.name,
            mimeType: entry.mimeType,
            parents: [entry.folderId],
            appProperties: {
              app_id: 'Bread-Barbershop',
              kind: 'invitation_asset',
              upload_key: uploadId,
            },
          }),
        }
      );
      if (response.status === 409) {
        const { file } = await assertManagedFileAccess(entry.fileId);
        if (file.appProperties?.upload_key === uploadId) {
          await writeJournal(
            key,
            { ...entry, complete: true, uploadUrl: undefined },
            JOURNAL_SECONDS
          );
          return NextResponse.json({
            uploadId,
            fileId: entry.fileId,
            name: entry.name,
            complete: true,
          });
        }
      }
      const uploadUrl = response.headers.get('location');
      if (!response.ok || !uploadUrl || !isGoogleUploadUrl(uploadUrl))
        throw new DriveHttpError(
          '업로드 연결을 준비하지 못했습니다.',
          response.ok ? 502 : response.status,
          {}
        );
      await writeJournal(
        key,
        { ...entry, uploadUrl, createdAt: Date.now() },
        JOURNAL_SECONDS
      );
      return NextResponse.json(
        { uploadId, uploadUrl },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    });
  } catch (error) {
    return driveErrorResponse(error);
  }
}

function isGoogleUploadUrl(value: string) {
  const url = new URL(value);
  return (
    url.protocol === 'https:' &&
    url.hostname === 'www.googleapis.com' &&
    url.pathname.startsWith('/upload/drive/v3/files')
  );
}
