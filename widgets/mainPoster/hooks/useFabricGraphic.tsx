import { Canvas, PencilBrush } from 'fabric';
import { useRef } from 'react';

import { PickerHsva } from '@/components/molecules/color-picker/components/colorPicker.types';

import { convertFabricColor } from '../utils/fabricUtils';

export const useFabricGraphic = () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const drawingListenerRef = useRef<((e: any) => void) | null>(null);

  const toggleDrawingMode = (
    canvas: Canvas,
    options: {
      enable: boolean;
      color?: PickerHsva;
      width?: number;
      onFinish?: () => void;
      autoDisable?: boolean;
    }
  ) => {
    const {
      enable,
      color = { h: 0, s: 0, v: 0, a: 1 },
      width = 5,
      onFinish,
      autoDisable = false,
    } = options;

    canvas.isDrawingMode = enable;
    canvas.defaultCursor = enable ? 'crosshair' : 'default';
    canvas.hoverCursor = enable ? 'crosshair' : 'move';

    // 기존 리스너 제거
    if (drawingListenerRef.current) {
      canvas.off('path:created', drawingListenerRef.current);
      drawingListenerRef.current = null;
    }

    if (enable) {
      // 기본 브러시 설정
      if (!(canvas.freeDrawingBrush instanceof PencilBrush)) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = width;
        canvas.freeDrawingBrush.color = convertFabricColor(color);
      }

      if (autoDisable) {
        const disableDrawingAfterPath = () => {
          canvas.isDrawingMode = false;
          canvas.defaultCursor = 'default';
          canvas.hoverCursor = 'move';
          if (onFinish) {
            onFinish();
          }
          canvas.requestRenderAll();
          canvas.off('path:created', disableDrawingAfterPath);
          drawingListenerRef.current = null;
        };

        drawingListenerRef.current = disableDrawingAfterPath;
        canvas.on('path:created', disableDrawingAfterPath);
      }
    }

    canvas.requestRenderAll();
  };

  const setBrushProperties = (
    canvas: Canvas,
    color: PickerHsva,
    width: number
  ) => {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = convertFabricColor(color);
      canvas.freeDrawingBrush.width = width;
    }
  };

  return {
    toggleDrawingMode,
    setBrushProperties,
  };
};
