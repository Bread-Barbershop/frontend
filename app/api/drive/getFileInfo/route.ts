import { NextResponse } from 'next/server';
import sharp from 'sharp';

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
    const resizedImages = await Promise.all(
      fileList.map(
        async (file: { id: string; name: string; mimeType: string }) => {
          const { file: metadata } = await assertManagedFileAccess(file.id);
          if (!metadata.mimeType.startsWith('image/'))
            throw new DriveHttpError('지원하지 않는 파일입니다.', 403, {});
          // 1. 구글 드라이브에서 이미지 가져오기
          const res = await googleFetch(
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch file ${file.id}: ${res.status}`);
          }

          const buffer = Buffer.from(await res.arrayBuffer());

          // 2. Sharp 리사이즈 (용량을 확 줄임)
          const resizedBuffer = await sharp(buffer)
            .resize(800)
            .jpeg({ quality: 70 })
            .toBuffer();

          // 3. Base64로 변환하여 객체에 담기
          return {
            id: file.id,
            name: file.name,
            // JSON 전송을 위해 Base64 문자열로 변환
            dataUrl: `data:${'image/jpeg'};base64,${resizedBuffer.toString('base64')}`,
            mimeType: 'image/jpeg',
          };
        }
      )
    );

    return NextResponse.json({ success: true, images: resizedImages });
  } catch (error) {
    captureDriveError({ error, operation: 'drive_image_asset_load' });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: error instanceof DriveHttpError ? error.status : 503 }
    );
  }
}
