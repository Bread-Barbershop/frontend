import { isSlotPlaceholderObject } from '../slot/queries';

import type { StaticCanvas } from 'fabric';

export function exportPosterImage(
  canvas: Pick<StaticCanvas, 'toDataURL'>,
  format: 'webp' | 'png'
) {
  return canvas.toDataURL({
    format,
    quality: format === 'webp' ? 0.85 : 1,
    multiplier: 2,
    filter: object => !isSlotPlaceholderObject(object),
  });
}

const PREVIEW_EXPORT_TARGET_PX = 1000;
const PREVIEW_EXPORT_MAX_MULTIPLIER = 8;
export const getPreviewExportMultiplier = (
  width: number,
  height: number
) => {
  const maxDimension = Math.max(width, height, 1);
  return Math.min(
    PREVIEW_EXPORT_MAX_MULTIPLIER,
    Math.max(1, PREVIEW_EXPORT_TARGET_PX / maxDimension)
  );
};
