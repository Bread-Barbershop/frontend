import { blobToFile } from '@/shared/utils/convertToFile';

import { AudioResponse, ImageResponse } from '../types/savedata';

export const fetchImageFiles = async (
  imageList: { id: string; name: string; mimeType: string }[],
  signal: AbortSignal
): Promise<{ id: string; file: File }[]> => {
  if (imageList.length === 0) return [];
  const res = await fetch('/api/drive/getFileInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileList: imageList }),
    signal,
  });

  if (!res.ok) throw new Error('이미지 정보를 불러오지 못했습니다.');

  const { images } = (await res.json()) as ImageResponse;

  // id와 file을 같이 반환하도록 수정
  const files = await Promise.all(
    images.map(async img => ({
      id: img.id,
      file: await blobToFile({
        name: img.name,
        mimeType: img.mimeType,
        dataUrl: img.dataUrl,
      }),
    }))
  );

  return files;
};

export const fetchAudioFiles = async (
  audioList: { id: string; name: string; mimeType: string }[],
  signal: AbortSignal
): Promise<{ id: string; file: File }[]> => {
  if (audioList.length === 0) return [];
  const res = await fetch('/api/drive/getAudioInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileList: audioList }),
    signal,
  });

  if (!res.ok) throw new Error('음원 정보를 불러오지 못했습니다.');

  const audios = (await res.json()) as AudioResponse;

  const files = await Promise.all(
    audios.audio.map(async audio => {
      return {
        id: audio.id,
        file: await blobToFile({
          name: audio.name,
          mimeType: audio.mimeType,
          dataUrl: audio.dataUrl,
        }),
      };
    })
  );
  return files;
};
