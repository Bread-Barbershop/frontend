import { centerCrop, makeAspectCrop } from 'react-image-crop';

import type { PercentCrop, PixelCrop } from 'react-image-crop';

export function centeredPhotoCrop(
  width: number,
  height: number,
  aspect?: number
) {
  const full: PercentCrop = { unit: '%', x: 0, y: 0, width: 100, height: 100 };
  if (!aspect) return full;
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 100 }, aspect, width, height),
    width,
    height
  );
}

export async function croppedPhotoFile(
  image: HTMLImageElement,
  rect: PixelCrop,
  name: string
) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 2000 / Math.max(rect.width, rect.height));
  canvas.width = Math.max(1, Math.round(rect.width * scale));
  canvas.height = Math.max(1, Math.round(rect.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('사진을 처리할 수 없습니다.');
  ctx.drawImage(
    image,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/webp', 0.92)
  );
  if (!blob) throw new Error('사진을 저장할 수 없습니다.');
  const extension = blob.type === 'image/webp' ? 'webp' : 'png';
  return new File([blob], name.replace(/\.[^.]+$/, '') + '-crop.' + extension, {
    type: blob.type,
  });
}
