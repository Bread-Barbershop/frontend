import 'server-only';

import { NextResponse } from 'next/server';

import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import {
  APP_IDENTIFIER,
  ensureThumbnailFile,
  THUMBNAIL_KIND,
  THUMBNAIL_NAME_PNG,
  THUMBNAIL_NAME_WEBP,
  ThumbnailPayload,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
// import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

/**
 * POST: 초대장 썸네일 데이터를 invitation-thumbnail.png에 저장합니다.
 *
 * Body: { invitationFolderId: string, thumbnailData: ThumbnailPayload }
 */
export async function POST(req: Request) {
  try {
    const { invitationFolderId, thumbnailData } = (await req.json()) as {
      invitationFolderId: string;
      thumbnailData: ThumbnailPayload;
    };

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId 필수' },
        { status: 400 }
      );
    }

    if (!thumbnailData || !thumbnailData.dataUrl) {
      return NextResponse.json(
        { ok: false, error: 'thumbnailData 및 dataUrl 필수' },
        { status: 400 }
      );
    }

    // 1) 기존 파일 확인
    const { thumbnailFileId } = await ensureThumbnailFile(invitationFolderId);

    // 2) 새 파일 생성 성공 후 기존 파일 삭제
    const finalFileId = await createThumbnailFile(
      invitationFolderId,
      thumbnailData
    );
    if (thumbnailFileId && finalFileId !== thumbnailFileId) {
      try {
        await deleteThumbnailFile(thumbnailFileId);
      } catch (error) {
        // 신규 파일 저장은 성공했으므로 이전 파일 정리 실패로 저장 결과를 무효화하지 않는다.
        captureDriveError({ error, operation: 'drive_thumbnail_old_file_cleanup' });
      }
    }

    // // 3) 공개 권한 설정
    // await publishPermissionWithRetry(finalFileId);

    const publicUrl = `https://drive.google.com/uc?export=download&id=${finalFileId}`;

    return NextResponse.json({
      ok: true,
      thumbnailFileId: finalFileId,
      publicUrl,
    });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      captureDriveError({
        error: err,
        operation: 'drive_thumbnail_save',
        status: err.status,
      });
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }
    captureDriveError({ error: err, operation: 'drive_thumbnail_save' });
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * GET: invitationFolderId로 invitation-thumbnail.png을 조회합니다.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invitationFolderId = searchParams.get('invitationFolderId')?.trim();

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId 필수' },
        { status: 400 }
      );
    }

    const { thumbnailFileId } = await ensureThumbnailFile(invitationFolderId);

    if (!thumbnailFileId) {
      return NextResponse.json(
        { ok: false, error: '썸네일 파일이 존재하지 않습니다.' },
        { status: 404 }
      );
    }

    const data = await loadThumbnailFileData(thumbnailFileId);

    return NextResponse.json({ ok: true, thumbnailFileId, data });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      captureDriveError({
        error: err,
        operation: 'drive_thumbnail_load',
        status: err.status,
      });
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }
    captureDriveError({ error: err, operation: 'drive_thumbnail_load' });
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

async function loadThumbnailFileData(fileId: string) {
  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new DriveHttpError(
      '파일 조회 실패',
      res.status,
      await res.json().catch(() => ({}))
    );
  }

  return res.json();
}

/**
 * dataUrl 서명(바이트 원본)을 최우선으로 검증하여 정규화된 MIME 타입과 파일명을 결정합니다.
 * 파일 확장자, 메타데이터 mimeType, 실제 업로드 Content-Type 불일치를 방지합니다.
 */
function resolveNormalizedThumbnailFormat(thumbnailData: ThumbnailPayload): {
  mimeType: 'image/webp' | 'image/png';
  fileName: string;
  imageBytes: Buffer;
} {
  const match = /^data:image\/(webp|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    thumbnailData.dataUrl
  );
  if (!match) {
    throw new DriveHttpError('지원하지 않는 썸네일 데이터 형식입니다.', 400, {});
  }

  const imageBytes = Buffer.from(match[2], 'base64');
  const isWebp =
    imageBytes.length >= 12 &&
    imageBytes.toString('ascii', 0, 4) === 'RIFF' &&
    imageBytes.toString('ascii', 8, 12) === 'WEBP';
  const isPng =
    imageBytes.length >= 8 &&
    imageBytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';

  // 파일 이름이나 외부 MIME 값이 아닌 실제 이미지 서명과 data URL을 대조한다.
  if ((match[1] === 'webp' && !isWebp) || (match[1] === 'png' && !isPng)) {
    throw new DriveHttpError('썸네일 이미지 데이터가 손상되었거나 형식이 다릅니다.', 400, {});
  }

  return {
    mimeType: isWebp ? 'image/webp' : 'image/png',
    fileName: isWebp ? THUMBNAIL_NAME_WEBP : THUMBNAIL_NAME_PNG,
    imageBytes,
  };
}

async function createThumbnailFile(
  invitationFolderId: string,
  thumbnailData: ThumbnailPayload
): Promise<string> {
  const { mimeType, fileName, imageBytes } = resolveNormalizedThumbnailFormat(thumbnailData);

  const metaRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fileName,
        mimeType,
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: THUMBNAIL_KIND,
        },
      }),
    }
  );

  const created = (await metaRes.json()) as { id: string };
  if (!metaRes.ok || !created.id) {
    throw new DriveHttpError(
      '파일 메타데이터 생성 실패',
      metaRes.status,
      created
    );
  }

  try {
    await updateThumbnailFile(created.id, imageBytes, mimeType);
    return created.id;
  } catch (error) {
    await deleteThumbnailFile(created.id);
    throw error;
  }
}

async function deleteThumbnailFile(fileId: string): Promise<void> {
  const res = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
    {
      method: 'DELETE',
    }
  );

  if (!res.ok && res.status !== 404) {
    const errorData = await res.json().catch(() => ({}));
    throw new DriveHttpError('기존 파일 삭제 실패', res.status, errorData);
  }
}

async function updateThumbnailFile(
  fileId: string,
  imageBytes: Buffer,
  normalizedMimeType: 'image/webp' | 'image/png'
): Promise<string> {
  const uploadRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      fileId
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': normalizedMimeType },
      body: imageBytes,
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    throw new DriveHttpError(
      '파일 내용 업데이트 실패',
      uploadRes.status,
      errorData
    );
  }

  return fileId;
}
