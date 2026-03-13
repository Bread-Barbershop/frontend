import { NextResponse } from 'next/server';

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
