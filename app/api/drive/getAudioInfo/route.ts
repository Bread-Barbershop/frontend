import { NextResponse } from 'next/server';

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
    const audioFiles = await Promise.all(
      fileList.map(
        async (file: { id: string; name: string; mimeType: string }) => {
          // 1. 구글 드라이브에서 이미지 가져오기
          const res = await googleFetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
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
            dataUrl: `data:${file.mimeType};base64,${base64String}`,
            mimeType: file.mimeType,
          };
        }
      )
    );

    return NextResponse.json({ success: true, audio: audioFiles });
  } catch (error) {
    captureDriveError({ error, operation: 'drive_audio_asset_load' });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
