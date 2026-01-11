import { NextResponse } from 'next/server';

import { googleFetch } from '@/app/oauthTest/utils/googleFetch';

export async function POST() {
  try {
    const WORKSPACE_NAME = '나의 모바일 청첩장'; // 사용자가 보게 될 워크스페이스 폴더 이름
    const APP_IDENTIFIER = 'Bread-Barbershop'; // 우리 서비스를 식별하기 위한 메타데이터.

    // 1. 이미 우리 워크스페이스 폴더가 있는지 검색
    // 폴더 이름이 일치하고 삭제되지 않았으며 우리 서비스 메타데이터가 붙어 있는 폴더만 조회
    const q = [
      `name='${WORKSPACE_NAME}'`,
      `mimeType='application/vnd.google-apps.folder'`,
      `trashed=false`,
      `appProperties has { key='app_id' and value='${APP_IDENTIFIER}' }`,
    ].join(' and ');

    const searchParams = new URLSearchParams({
      q,
      fields: 'files(id,name,createdTime)',
      orderBy: 'createdTime', // 오래된 순으로 정렬.
      pageSize: '1', // 가장 오래된걸 반환.
    });

    const searchResponse = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`
    );

    const searchData = await searchResponse.json();

    // 검색 자체가 실패한 경우 (권한 문제, 쿼리 오류 등)
    if (!searchResponse.ok) {
      return NextResponse.json(
        {
          error: '워크스페이스 검색 실패',
          details: searchData,
        },
        { status: searchResponse.status }
      );
    }

    // 2. 폴더가 이미 존재하면 해당 폴더를 그대로 사용
    if (searchData.files?.length > 0) {
      return NextResponse.json({
        message: '기존 워크스페이스를 사용합니다.',
        folderId: searchData.files[0].id,
      });
    }

    // 3. 폴더가 없으면 새로 생성
    const createResponse = await googleFetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: WORKSPACE_NAME,
          mimeType: 'application/vnd.google-apps.folder',
          appProperties: {
            app_id: APP_IDENTIFIER,
          },
        }),
      }
    );

    const folderData = await createResponse.json();

    // 폴더 생성 실패 처리
    if (!createResponse.ok) {
      return NextResponse.json(
        { error: '폴더 생성 실패', details: folderData },
        { status: createResponse.status }
      );
    }

    return NextResponse.json({
      message: '새로운 워크스페이스를 생성했습니다.',
      folderId: folderData.id,
    });
  } catch (error) {
    console.error('Drive API Error:', error);

    // googleFetch에서 던진 에러 처리
    if (error instanceof Error) {
      if (error.message === '유효한 요청이 아닙니다.') {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }
      if (error.message === '재로그인이 필요합니다.') {
        return NextResponse.json(
          { error: '재로그인이 필요합니다.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: '드라이브 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
