import { Canvas, PencilBrush, SprayBrush } from 'fabric';
import { useRef, useState } from 'react';

import { PickerHsva } from '@/components/molecules/color-picker/components/colorPicker.types';

import { DrawingTool, PencilConfig, PenConfig } from '../types/fabric';
import { convertFabricColor } from '../utils/fabricUtils';

export const useFabricGraphic = () => {
  const [drawingType, setDrawingType] = useState<DrawingTool>('pen');
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const drawingListenerRef = useRef<((e: any) => void) | null>(null);

  const toggleDrawingMode = (
    canvas: Canvas,
    options: {
      enable: boolean;
      type?: DrawingTool;
      color?: PickerHsva;
      config?: PenConfig | PencilConfig;
      onFinish?: () => void;
      autoDisable?: boolean;
    }
  ) => {
    const {
      enable,
      type = 'pen',
      color = { h: 0, s: 0, v: 0, a: 1 },
      config,
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
      if (type === 'pen') {
        const penConfig: PenConfig = {
          width: 5,
          ...config,
        };
        setBrushProperties(canvas, 'pen', color, penConfig);
      } else if (type === 'pencil') {
        const pencilConfig: PencilConfig = {
          width: 5,
          density: 15,
          dotWidth: 2,
          dotWidthVariance: 2,
          randomOpacity: true,
          optimizeOverlapping: true,
          ...config,
        };
        setBrushProperties(canvas, 'pencil', color, pencilConfig);
      } else {
        // 지우개인경우
        setBrushProperties(canvas, 'pen', color, { width: 5 });
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
    type: DrawingTool,
    color: PickerHsva,
    config: PenConfig | PencilConfig
  ) => {
    if (type === 'pen') {
      if (!(canvas.freeDrawingBrush instanceof PencilBrush)) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = convertFabricColor(color);
      canvas.freeDrawingBrush.width = config.width;
    } else if (type === 'pencil') {
      if (!(canvas.freeDrawingBrush instanceof SprayBrush)) {
        canvas.freeDrawingBrush = new SprayBrush(canvas);
      }
      const sprayBrush = canvas.freeDrawingBrush as SprayBrush;
      sprayBrush.color = convertFabricColor(color);
      sprayBrush.width = config.width;

      if ('density' in config) {
        sprayBrush.density = config.density;
        sprayBrush.dotWidth = Math.floor(config.width / 2);
        sprayBrush.dotWidthVariance = config.dotWidthVariance;
        sprayBrush.randomOpacity = config.randomOpacity;
        sprayBrush.optimizeOverlapping = config.optimizeOverlapping;
      }
    }
  };

  return {
    toggleDrawingMode,
    setBrushProperties,
    setDrawingType,
    drawingType,
  };
};
