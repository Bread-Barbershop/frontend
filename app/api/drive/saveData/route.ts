import { NextResponse } from 'next/server';

import {
  assertManagedFileAccess,
  assertSameOriginRequest,
} from '@/app/api/drive/_lib/driveAccess';
import { driveErrorResponse } from '@/app/api/drive/_lib/driveErrorResponse';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { markSaveStage } from '@/app/api/drive/_lib/saveJournal';
import { sanitizeInvitationHtml } from '@/shared/utils/sanitizeInvitationHtml';

export async function POST(request: Request) {
  try {
    assertSameOriginRequest(request);
    const text = await request.text();
    if (Buffer.byteLength(text) > 3 * 1024 * 1024)
      throw new DriveHttpError('초대장 데이터가 너무 큽니다.', 413, {});
    const { fileId, payload } = JSON.parse(text);
    const { file, invitation } = await assertManagedFileAccess(fileId);
    if (
      file.appProperties?.app_id !== 'Bread-Barbershop' ||
      file.appProperties.kind !== 'invitation_data_json' ||
      file.mimeType !== 'application/json'
    ) {
      throw new DriveHttpError(
        '초대장 데이터 파일만 저장할 수 있습니다.',
        403,
        {}
      );
    }
    if (
      !payload ||
      !Array.isArray(payload.blocks) ||
      !payload.bulkData ||
      !payload.mainPoster
    )
      throw new DriveHttpError(
        '초대장 데이터 형식이 올바르지 않습니다.',
        400,
        {}
      );
    const response = await googleFetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,name`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizeInvitationHtml(payload)),
      }
    );
    if (!response.ok)
      throw new DriveHttpError(
        '초대장 저장에 실패했습니다.',
        response.status,
        {}
      );
    await markSaveStage(invitation.appProperties!.inv_id, 'data_saved');
    return NextResponse.json(
      { fileId, name: file.name },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return driveErrorResponse(error);
  }
}
