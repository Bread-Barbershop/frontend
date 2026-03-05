import { blobToFile } from '@/shared/utils/convertToFile';

interface FetchFileInfoResponse {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}

export const fetchImageFiles = async (
  imageList: { id: string; name: string }[],
  signal: AbortSignal
): Promise<{ id: string; file: File }[]> => {
  console.log('imageList', imageList);
  const res = await fetch('/api/drive/getFileInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileList: imageList }),
    signal,
  });

  if (!res.ok) throw new Error('이미지 정보를 불러오지 못했습니다.');

  const { images } = (await res.json()) as { images: FetchFileInfoResponse[] };

  // id와 file을 같이 반환하도록 수정
  const files = await Promise.all(
    images.map(async img => ({
      id: img.id,
      file: await blobToFile(img),
    }))
  );

  return files;
};
