import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { captureDriveError } from '../_lib/captureDriveError';
import { googleFetch } from '../_lib/googleFetch';

export async function POST(req: Request) {
  const { fileList } = await req.json(); // [{id, name}, ...]
  if (!Array.isArray(fileList) || fileList.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Invalid or empty fileList' },
      { status: 400 }
    );
  }
  try {
    const resizedImages = await Promise.all(
      fileList.map(
        async (file: { id: string; name: string; mimeType: string }) => {
          // 1. 구글 드라이브에서 이미지 가져오기
          const res = await googleFetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
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
            dataUrl: `data:${file.mimeType};base64,${resizedBuffer.toString('base64')}`,
            mimeType: file.mimeType,
          };
        }
      )
    );

    return NextResponse.json({ success: true, images: resizedImages });
  } catch (error) {
    captureDriveError({ error, operation: 'drive_image_asset_load' });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
