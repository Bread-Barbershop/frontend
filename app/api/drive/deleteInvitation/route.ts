import { NextResponse } from 'next/server';

import { googleFetch } from '../_lib/googleFetch';

/**
 * @param {string} folderId - 삭제할 폴더의 ID
 */

export async function DELETE(req: Request) {
  const { folderId } = await req.json();

  const url = `https://www.googleapis.com/drive/v3/files/${folderId}`;

  const res = await googleFetch(url, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`휴지통 이동 실패: ${JSON.stringify(errorData)}`);
  }

  return NextResponse.json({ success: true });
}
