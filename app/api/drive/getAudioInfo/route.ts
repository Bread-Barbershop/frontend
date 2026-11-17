import { NextResponse } from 'next/server';

import {
  assertManagedFileAccess,
  assertSameOriginRequest,
} from '@/app/api/drive/_lib/driveAccess';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';

import { captureDriveError } from '../_lib/captureDriveError';
import { googleFetch } from '../_lib/googleFetch';

export async function POST(req: Request) {
  const { fileList } = await req.json(); // [{id, name}, ...]
  if (
    !Array.isArray(fileList) ||
    fileList.length === 0 ||
    fileList.length > 100
  ) {
    return NextResponse.json(
      { success: false, error: 'Invalid or empty fileList' },
      { status: 400 }
    );
  }
  try {
    assertSameOriginRequest(req);
    const audioFiles = await Promise.all(
      fileList.map(
        async (file: { id: string; name: string; mimeType: string }) => {
          const { file: metadata } = await assertManagedFileAccess(file.id);
          if (!metadata.mimeType.startsWith('audio/'))
            throw new DriveHttpError('지원하지 않는 파일입니다.', 403, {});
          // 1. 구글 드라이브에서 이미지 가져오기
          const res = await googleFetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch file ${file.id}: ${res.status}`);
          }

          // 1. ArrayBuffer로 데이터를 받습니다.
          const arrayBuffer = await res.arrayBuffer();

          // 2. Buffer로 변환 후 Base64 문자열로 인코딩합니다.
          const buffer = Buffer.from(arrayBuffer);
          const base64String = buffer.toString('base64');

          return {
            id: file.id,
            name: file.name,
            // 3. 클라이언트가 바로 인식할 수 있도록 Data URL 형식을 만듭니다.
            dataUrl: `data:${metadata.mimeType};base64,${base64String}`,
            mimeType: metadata.mimeType,
          };
        }
      )
    );

    return NextResponse.json({ success: true, audio: audioFiles });
  } catch (error) {
    captureDriveError({ error, operation: 'drive_audio_asset_load' });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: error instanceof DriveHttpError ? error.status : 503 }
    );
  }
}
