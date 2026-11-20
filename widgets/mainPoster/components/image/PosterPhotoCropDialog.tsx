import { useMemo } from 'react';
import { convertToPercentCrop } from 'react-image-crop';

import { drawPhotoCrop } from '@/components/molecules/picture/photoCrop';
import { PhotoCropDialog } from '@/components/molecules/picture/PhotoCropDialog';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { getSlotId } from '@/widgets/mainPoster/slot/queries';

import type { Canvas, FabricImage } from 'fabric';
import type { PixelCrop } from 'react-image-crop';

export function PosterPhotoCropDialog({
  canvas,
  target,
}: {
  canvas: Canvas;
  target: FabricImage;
}) {
  const {
    setCropTarget,
    runHistoryTransaction,
    replaceSlotImage,
    setBackgroundImage,
  } = useFabricContext();
  const slotId = getSlotId(target);
  const isBackground = target.get('id') === 'background-layer';
  const source = useMemo(() => target.getSrc(true), [target]);
  const original = target.getOriginalSize();
  const initialCrop = target.hasCrop()
    ? convertToPercentCrop(
        {
          unit: 'px',
          x: target.cropX,
          y: target.cropY,
          width: target.width,
          height: target.height,
        },
        original.width,
        original.height
      )
    : undefined;

  const commit = async (change: () => Promise<FabricImage>) => {
    if (!canvas.contains(target)) throw new Error('사진이 변경되었습니다.');
    await runHistoryTransaction(
      async () => {
        const selected = await change();
        canvas.setActiveObject(selected);
        canvas.requestRenderAll();
        useEditorStore.getState().setIsDirty(true);
      },
      { save: true, editInPlace: true }
    );
  };

  const applyCrop = (image: HTMLImageElement, rect: PixelCrop) =>
    commit(async () => {
      if (slotId) {
        // Slot replacement reapplies its existing filters to the new source.
        let sourceImage = image;
        if (target.filters.length) {
          sourceImage = new Image();
          sourceImage.crossOrigin = 'anonymous';
          sourceImage.src = target.getSrc();
          await sourceImage.decode();
        }
        const src = drawPhotoCrop(sourceImage, rect).toDataURL(
          'image/webp',
          0.92
        );
        const replaced = await replaceSlotImage(target, src);
        if (!replaced) throw new Error('프레임 사진을 변경할 수 없습니다.');
        return replaced;
      }
      const center = target.getRelativeCenterPoint();
      target.set({
        cropX: rect.x,
        cropY: rect.y,
        width: rect.width,
        height: rect.height,
      });
      target.setPositionByOrigin(center, 'center', 'center');
      target.setCoords();
      return target;
    });

  const applyBackground = (_image: HTMLImageElement, rect: PixelCrop) =>
    commit(async () => {
      const background = await setBackgroundImage(source, {
        saveHistory: false,
        crop: rect,
        opacity: isBackground ? target.opacity : 1,
      });
      if (!background) throw new Error('배경을 변경할 수 없습니다.');
      if (!isBackground) canvas.remove(target);
      return background;
    });

  return (
    <PhotoCropDialog
      src={source}
      initialCrop={initialCrop}
      onApply={isBackground ? undefined : applyCrop}
      poster={{
        aspect: canvas.width / canvas.height,
        onApplyBackground: applyBackground,
      }}
      onClose={() => setCropTarget(null)}
    />
  );
}
