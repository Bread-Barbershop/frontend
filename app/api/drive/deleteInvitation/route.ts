import { NextResponse } from 'next/server';

import { deleteShortCodeMapping } from '@/app/api/short-url/_lib/shortUrlStore';

import { googleFetch } from '../_lib/googleFetch';

/**
 * @param {string} folderId - 삭제할 폴더의 ID
 */

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.folderId) {
      return NextResponse.json(
        { success: false, message: 'folderId가 필요합니다.' },
        { status: 400 }
      );
    }

    const { folderId } = body;
    const url = `https://www.googleapis.com/drive/v3/files/${folderId}`;

    const res = await googleFetch(url, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Drive delete error:', errorData);
      return NextResponse.json(
        {
          success: false,
          message: '폴더 삭제에 실패했습니다.',
          error: errorData,
        },
        { status: res.status }
      );
    }

    try {
      // Drive 삭제가 성공한 뒤 짧은 URL 매핑도 정리한다. Redis 실패는 삭제 성공을 막지 않는다.
      await deleteShortCodeMapping(folderId);
    } catch (error) {
      console.error('Short URL mapping delete failed:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
