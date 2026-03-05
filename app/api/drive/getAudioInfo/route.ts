import { NextResponse } from 'next/server';

import { googleFetch } from '../_lib/googleFetch';

export async function POST(req: Request) {
  const { fileList } = await req.json(); // [{id, name}, ...]

  try {
    const audioFiles = await Promise.all(
      fileList.map(async (file: any) => {
        // 1. 구글 드라이브에서 이미지 가져오기
        const res = await googleFetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
        );

        // 1. ArrayBuffer로 데이터를 받습니다.
        const arrayBuffer = await res.arrayBuffer();

        // 2. Buffer로 변환 후 Base64 문자열로 인코딩합니다.
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');

        return {
          id: file.id,
          name: file.name,
          // 3. 클라이언트가 바로 인식할 수 있도록 Data URL 형식을 만듭니다.
          dataUrl: `data:audio/mpeg;base64,${base64String}`,
          mimeType: 'audio/mpeg',
        };
      })
    );

    return NextResponse.json({ success: true, audio: audioFiles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
