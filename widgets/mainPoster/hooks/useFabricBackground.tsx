import { rgbaToHsva } from '@uiw/color-convert';
import { Canvas, FabricImage } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import {
  ColorPickerChange,
  ColorPickerValue,
} from '@/components/molecules/color-picker/components/colorPicker.types';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { parseInvitationBackgroundColor } from '@/shared/utils/invitationBackgroundColor';

import { FabricImageWithLock } from '../types/fabric';
import { convertFabricColor } from '../utils/fabricUtils';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
}

const BACKGROUND_POSITION_MIN = -50;
const BACKGROUND_POSITION_MAX = 50;
const BACKGROUND_SCALE_MIN = 100;
const BACKGROUND_SCALE_MAX = 400;

const clampBackgroundPosition = (value: number) =>
  Math.min(BACKGROUND_POSITION_MAX, Math.max(BACKGROUND_POSITION_MIN, value));

const clampBackgroundScale = (value: number) =>
  Math.min(BACKGROUND_SCALE_MAX, Math.max(BACKGROUND_SCALE_MIN, value));

const getBackgroundObject = (canvas: Canvas | null) => {
  if (!canvas) return null;

  return canvas
    .getObjects()
    .find(obj => obj.get('id') === 'background-layer') as
    | FabricImageWithLock
    | undefined
    | null;
};

const getCoverScale = (canvas: Canvas, image: FabricImage) => {
  const scaleX = canvas.width / image.width;
  const scaleY = canvas.height / image.height;

  return Math.max(scaleX, scaleY);
};

const applyBackgroundTransform = (
  canvas: Canvas,
  image: FabricImageWithLock,
  options?: {
    x?: number;
    y?: number;
    scale?: number;
  }
) => {
  const baseScale = image.imageBaseScale ?? getCoverScale(canvas, image);
  const sliderX = clampBackgroundPosition(options?.x ?? image.imageSliderX ?? 0);
  const sliderY = clampBackgroundPosition(options?.y ?? image.imageSliderY ?? 0);
  const sliderScale = clampBackgroundScale(
    options?.scale ?? image.imageSliderScale ?? BACKGROUND_SCALE_MIN
  );

  const appliedScale = baseScale * (sliderScale / 100);

  image.set({
    imageBaseScale: baseScale,
    imageSliderX: sliderX,
    imageSliderY: sliderY,
    imageSliderScale: sliderScale,
    scaleX: appliedScale,
    scaleY: appliedScale,
    originX: 'center',
    originY: 'center',
    left: canvas.width / 2 + (canvas.width * sliderX) / 100,
    top: canvas.height / 2 + (canvas.height * sliderY) / 100,
    selectable: true,
    evented: true,
    hasControls: false,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    editable: false,
    isLocked: true,
  });

  image.setCoords();
};

export const useFabricBackground = ({ canvas, saveHistory }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState<ColorPickerValue>({
    h: 0,
    s: 0,
    v: 100,
    a: 1,
  });
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(1);
  const lastCanvasColor = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!canvas) return;
    const syncBackgroundColor = () => {
      const value = canvas.backgroundColor;
      if (typeof value !== 'string' || lastCanvasColor.current === value) return;
      lastCanvasColor.current = value;
      const rgba = parseInvitationBackgroundColor(value || 'transparent');
      if (rgba) setBackgroundColor(rgbaToHsva(rgba));
    };
    syncBackgroundColor();
    return canvas.on('after:render', syncBackgroundColor);
  }, [canvas]);

  const updateBackgroundColor = (
    color: ColorPickerChange | ColorPickerValue
  ) => {
    if (!canvas) return;

    const existingBg = getBackgroundObject(canvas);
    if (existingBg) {
      canvas.remove(existingBg);
    }

    const fill = convertFabricColor(color);
    if (existingBg || canvas.backgroundImage || canvas.backgroundColor !== fill) {
      useEditorStore.getState().setIsDirty(true);
    }
    lastCanvasColor.current = fill;
    canvas.set({
      backgroundColor: fill,
      backgroundImage: null,
    });
    const nextColor =
      typeof color === 'object' && 'hsva' in color ? color.hsva : color;

    setBackgroundColor(nextColor);
    canvas.requestRenderAll();
    saveHistory();
  };

  const setBackgroundImage = async (
    base64: string,
    options?: {
      saveHistory?: boolean;
      crop?: { x: number; y: number; width: number; height: number };
      opacity?: number;
    }
  ) => {
    if (!canvas) return null;

    try {
      const existingBg = getBackgroundObject(canvas);
      const crop = options?.crop;
      const reuseBackground = crop ? null : existingBg;
      const nextImage =
        reuseBackground ??
        (await FabricImage.fromURL(base64, { crossOrigin: 'anonymous' }));

      if (reuseBackground) {
        await reuseBackground.setSrc(base64);
        reuseBackground.set({ cropX: 0, cropY: 0 });
      }
      if (crop) {
        nextImage.set({
          cropX: crop.x,
          cropY: crop.y,
          width: crop.width,
          height: crop.height,
        });
      }

      const baseScale = getCoverScale(canvas, nextImage);

      nextImage.set({
        id: 'background-layer',
        opacity: options?.opacity ?? existingBg?.opacity ?? backgroundImageOpacity,
        imageBaseScale: baseScale,
        imageSliderX: 0,
        imageSliderY: 0,
        imageSliderScale: BACKGROUND_SCALE_MIN,
      });

      applyBackgroundTransform(canvas, nextImage, {
        x: 0,
        y: 0,
        scale: BACKGROUND_SCALE_MIN,
      });

      if (!reuseBackground) {
        canvas.insertAt(0, nextImage);
        if (existingBg) canvas.remove(existingBg);
      }

      canvas.setActiveObject(nextImage);
      canvas.requestRenderAll();

      if (options?.saveHistory !== false) {
        saveHistory();
      }

      return nextImage as FabricImageWithLock;
    } catch (error) {
      console.error('Failed to set background image:', error);
      return null;
    }
  };

  const removeBackgroundImage = (options?: { saveHistory?: boolean }) => {
    if (!canvas) return false;

    const existingBg = getBackgroundObject(canvas);
    if (!existingBg) return false;

    const currentActiveObject = canvas.getActiveObject();
    if (currentActiveObject === existingBg) {
      canvas.discardActiveObject();
    }

    canvas.remove(existingBg);
    canvas.requestRenderAll();

    if (options?.saveHistory !== false) {
      saveHistory();
    }

    return true;
  };

  const updateBackgroundImageOpacity = (opacity: number) => {
    if (!canvas) return;

    const existingBg = getBackgroundObject(canvas);

    setBackgroundImageOpacity(opacity);

    if (!existingBg) return;

    existingBg.set({ opacity });
    canvas.requestRenderAll();
    saveHistory();
  };

  const getBackgroundImageTransform = () => {
    const existingBg = getBackgroundObject(canvas);

    return {
      hasImage: Boolean(existingBg),
      x: existingBg?.imageSliderX ?? 0,
      y: existingBg?.imageSliderY ?? 0,
      scale: existingBg?.imageSliderScale ?? BACKGROUND_SCALE_MIN,
    };
  };

  const updateBackgroundImagePosition = (
    axis: 'x' | 'y',
    value: number,
    options?: {
      saveHistory?: boolean;
    }
  ) => {
    if (!canvas) return;

    const existingBg = getBackgroundObject(canvas);
    if (!existingBg) return;

    applyBackgroundTransform(canvas, existingBg, {
      x: axis === 'x' ? value : existingBg.imageSliderX,
      y: axis === 'y' ? value : existingBg.imageSliderY,
    });

    canvas.setActiveObject(existingBg);
    canvas.requestRenderAll();

    if (options?.saveHistory) {
      saveHistory();
    }
  };

  const updateBackgroundImageScale = (
    value: number,
    options?: {
      saveHistory?: boolean;
    }
  ) => {
    if (!canvas) return;

    const existingBg = getBackgroundObject(canvas);
    if (!existingBg) return;

    applyBackgroundTransform(canvas, existingBg, {
      scale: value,
    });

    canvas.setActiveObject(existingBg);
    canvas.requestRenderAll();

    if (options?.saveHistory) {
      saveHistory();
    }
  };

  return {
    backgroundColor,
    backgroundImageOpacity,
    updateBackgroundColor,
    setBackgroundImage,
    removeBackgroundImage,
    updateBackgroundImageOpacity,
    getBackgroundImageTransform,
    updateBackgroundImagePosition,
    updateBackgroundImageScale,
  };
};
