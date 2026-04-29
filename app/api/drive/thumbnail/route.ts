import 'server-only';

import { NextResponse } from 'next/server';

import {
  APP_IDENTIFIER,
  ensureThumbnailFile,
  THUMBNAIL_KIND,
  THUMBNAIL_NAME,
  ThumbnailPayload,
} from '@/app/api/drive/_lib/ensureThumbnailFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

/**
 * POST: 초대장 썸네일 데이터를 invitation-thumbnail.json에 저장합니다.
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
      await deleteThumbnailFile(thumbnailFileId);
    }

    // 3) 공개 권한 설정
    await publishPermissionWithRetry(finalFileId);

    const publicUrl = `https://drive.google.com/uc?export=download&id=${finalFileId}`;

    return NextResponse.json({
      ok: true,
      thumbnailFileId: finalFileId,
      publicUrl,
    });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }
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
 * GET: invitationFolderId로 invitation-thumbnail.json을 조회합니다.
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
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }
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

async function createThumbnailFile(
  invitationFolderId: string,
  thumbnailData: ThumbnailPayload
): Promise<string> {
  const metaRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: THUMBNAIL_NAME,
        mimeType: 'application/json',
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

  await updateThumbnailFile(created.id, thumbnailData);
  return created.id;
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
  thumbnailData: ThumbnailPayload
): Promise<string> {
  const uploadRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      fileId
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(thumbnailData),
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
