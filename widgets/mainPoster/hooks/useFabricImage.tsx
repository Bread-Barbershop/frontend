import { Canvas, FabricImage } from 'fabric';
import { useCallback, useState } from 'react';

import { FilterType } from '@/components/molecules/image-editor';

import { PhotoPreset } from '../libs/customImage-filter';
import { PhotoPresetOptions, FabricImageWithLock } from '../types/fabric';
import { getImagePanelMode, isFilledSlotImage } from '../utils/imageSlot';

interface Props {
  syncActiveObjectInfo?: (canvas: Canvas) => void;
  saveHistory: () => void;
}

export const useFabricImage = ({
  syncActiveObjectInfo,
  saveHistory,
}: Props) => {
  const [cropTarget, setCropTarget] = useState<FabricImageWithLock | null>(
    null
  );
  const startCrop = useCallback((image: FabricImageWithLock) => {
    const mode = getImagePanelMode(image);
    if (
      mode === 'background-image' ||
      (mode === 'user-image' && !image.isLocked) ||
      isFilledSlotImage(image)
    ) {
      setCropTarget(image);
    }
  }, []);

  //사진 보정 필터
  const applyImageFilter = (
    options: PhotoPresetOptions,
    canvas: Canvas,
    type: FilterType
  ) => {
    const activeObject = canvas.getActiveObject() as FabricImageWithLock;
    if (!activeObject || activeObject.isLocked) return;

    if (!(activeObject instanceof FabricImage)) return;
    const photoFilter = new PhotoPreset({
      exposure: options.exposure ?? 50,
      contrast: options.contrast ?? 50,
      saturation: options.saturation ?? 50,
      temperature: options.temperature ?? 50,
      tint: options.tint ?? 50,
      fade: options.fade ?? 0,
      vignette: options.vignette ?? 0,
      grain: options.grain ?? 0,
      bw: options.bw ?? 0,
      type: type,
    });

    activeObject.filters = [photoFilter];
    activeObject.applyFilters();
    canvas.requestRenderAll();

    if (syncActiveObjectInfo) {
      syncActiveObjectInfo(canvas);
    }

    saveHistory();
  };

  // 이미지 추가
  const addImage = async (url: string, canvas: Canvas) => {
    try {
      const img = await FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      });

      // 초기 이미지 크기 최적화 - 캔버스 절반 크기로 제한
      const maxWidth = canvas.width ? canvas.width / 2 : 300;
      if (img.width > maxWidth) {
        img.scaleToWidth(maxWidth);
      }

      // 로드된 이미지가 화면 중앙에 위치하도록 설정
      img.set({
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
        id: `image-${Date.now()}`,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      if (syncActiveObjectInfo) {
        syncActiveObjectInfo(canvas);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  async function compressImage(base64: string) {
    return new Promise<string>(resolve => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const MAX_SIZE = 1600;

        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/webp', 0.8);

        resolve(compressed);
      };

      img.src = base64;
    });
  }

  return {
    cropTarget,
    setCropTarget,
    applyImageFilter,
    startCrop,
    addImage,
    compressImage,
  };
};
