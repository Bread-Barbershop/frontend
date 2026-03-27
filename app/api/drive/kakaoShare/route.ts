import 'server-only';

import { NextResponse } from 'next/server';

import {
  ensureKakaoShareFile,
  KakaoSharePayload,
} from '@/app/api/drive/_lib/ensureKakaoShareFile';
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
      shareData: KakaoSharePayload;
    };

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId 필수' },
        { status: 400 }
      );
    }

    // 1) 파일 확보 (고정 파일명 kakao-share.json)
    const { kakaoShareFileId } = await ensureKakaoShareFile(invitationFolderId);

    // 2) 내용 업데이트
    const uploadRes = await googleFetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
        kakaoShareFileId
      )}?uploadType=media&supportsAllDrives=true`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(shareData),
      }
    );

    if (!uploadRes.ok) {
      return NextResponse.json(
        { ok: false, error: 'JSON 업데이트 실패' },
        { status: 500 }
      );
    }

    // 3) kakao-share.json 공개 권한 설정
    await publishPermissionWithRetry(kakaoShareFileId);

    // 4) 이미지 파일 공개 권한 설정 (카카오톡이 인증 없이 접근 가능해야 함)
    let imagePublicUrl: string | undefined;
    if (shareData.imageFileId) {
      await publishPermissionWithRetry(shareData.imageFileId);
      // lh3 URL은 인증 없이 바로 이미지를 응답하므로 카카오톡 호환이 가장 좋음
      imagePublicUrl = `https://lh3.googleusercontent.com/d/${shareData.imageFileId}`;
    }

    const publicUrl = `https://drive.google.com/uc?export=download&id=${kakaoShareFileId}`;

    return NextResponse.json({
      ok: true,
      kakaoShareFileId,
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

    const kakaoShareFileId = searchData.files[0].id;

    // 3) 내용 다운로드
    const res = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        kakaoShareFileId
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

    return NextResponse.json({ ok: true, kakaoShareFileId, data });
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
