import 'server-only';

import { NextResponse } from 'next/server';

import {
  APP_IDENTIFIER,
  ensureShareUrlFile,
  SHARE_URL_KIND,
  SHARE_URL_NAME,
  ShareUrlPayload,
} from '@/app/api/drive/_lib/ensureShareUrlFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';

/**
 * POST: 카카오 공유 데이터를 kakao-share.json에 저장 (생성 또는 업데이트)
 *
 * Body: { invitationFolderId: string, shareData: KakaoSharePayload }
 *
 * 흐름:
 * 1. ensureKakaoShareFile로 파일 확보 (없으면 생성)
 * 2. 내용 업데이트
 * 3. 공개 권한 설정
 */
export async function POST(req: Request) {
  try {
    const { invitationFolderId, shareData } = (await req.json()) as {
      invitationFolderId: string;
      shareData: ShareUrlPayload;
    };

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId 필수' },
        { status: 400 }
      );
    }

    // 1) 파일 확보 시도 (검색만 수행)
    const { shareUrlFileId } = await ensureShareUrlFile(invitationFolderId);

    // 2) 파일이 없으면 새로 생성, 있으면 업데이트
    const finalFileId = shareUrlFileId
      ? await updateShareUrlFile(shareUrlFileId, shareData)
      : await createShareUrlFile(invitationFolderId, shareData);

    // 3) kakao-share.json 공개 권한 설정
    await publishPermissionWithRetry(finalFileId);

    // 4) 이미지 파일 공개 권한 설정
    let imagePublicUrl: string | undefined;
    if (shareData.imageFileId) {
      await publishPermissionWithRetry(shareData.imageFileId);
      imagePublicUrl = `https://lh3.googleusercontent.com/d/${shareData.imageFileId}`;
    }

    const publicUrl = `https://drive.google.com/uc?export=download&id=${finalFileId}`;

    return NextResponse.json({
      ok: true,
      shareUrlFileId: finalFileId,
      publicUrl,
      imagePublicUrl,
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
 * GET: invitationFolderId로 kakao-share.json 조회
 *
 * Query: ?invitationFolderId=<folderId>
 *
 * 흐름:
 * 1. ensureKakaoShareFile로 파일 ID 확보
 * 2. 파일 내용 다운로드
 */
export async function GET() {
  try {
    //  드라이브 전체에서 이름이 kakao-share.json인 파일을 직접 검색 (가장 최근 수정된 1개)
    const query = [
      `trashed=false`,
      `appProperties has { key='app_id' and value='Bread-Barbershop' }`,
      `appProperties has { key='kind' and value='kakao_share_json' }`,
      `name='kakao-share.json'`,
    ].join(' and ');

    const searchParams = new URLSearchParams({
      q: query,
      spaces: 'drive',
      fields: 'files(id)',
      orderBy: 'modifiedTime desc',
      pageSize: '1',
    });

    const searchResponse = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`,
      { cache: 'no-store' }
    );

    if (!searchResponse.ok) {
      return NextResponse.json(
        { ok: false, error: 'kakao-share.json 전역 검색 실패' },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();
    if (!searchData.files || searchData.files.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            '드라이브 내에 kakao-share.json 파일이 존재하지 않습니다. 먼저 저장해주세요.',
        },
        { status: 404 }
      );
    }

    const shareUrlFileId = searchData.files[0].id;

    // 3) 내용 다운로드
    const res = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        shareUrlFileId
      )}?alt=media`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: '파일 조회 실패' },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({ ok: true, shareUrlFileId, data });
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
 * 전용 헬퍼: kakao-share.json 파일 생성 (메타데이터 + 초기 데이터)
 */
async function createShareUrlFile(
  invitationFolderId: string,
  shareData: ShareUrlPayload
): Promise<string> {
  // 1) 파일 메타데이터 생성 (POST)
  const metaRes = await googleFetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: SHARE_URL_NAME,
        mimeType: 'application/json',
        parents: [invitationFolderId],
        appProperties: {
          app_id: APP_IDENTIFIER,
          kind: SHARE_URL_KIND,
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

  // 2) 생성된 ID에 실제 데이터 쓰기 (PATCH)
  await updateShareUrlFile(created.id, shareData);
  return created.id;
}

/**
 * 전용 헬퍼: 기존 kakao-share.json 내용 업데이트
 */
async function updateShareUrlFile(
  fileId: string,
  shareData: ShareUrlPayload
): Promise<string> {
  const uploadRes = await googleFetch(
    `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      fileId
    )}?uploadType=media&supportsAllDrives=true`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(shareData),
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
