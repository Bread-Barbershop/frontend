import { NextResponse } from 'next/server';

import { commitInvitationData } from '@/app/api/drive/_lib/commitInvitationData';
import { assertSameOriginRequest } from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest(request);
    const text = await request.text();
    if (Buffer.byteLength(text) > 3 * 1024 * 1024)
      throw new DriveHttpError('초대장 데이터가 너무 큽니다.', 413, {});
    const { fileId, payload } = JSON.parse(text);
    return NextResponse.json(await commitInvitationData(fileId, payload), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return driveErrorResponse(error);
  }
}
