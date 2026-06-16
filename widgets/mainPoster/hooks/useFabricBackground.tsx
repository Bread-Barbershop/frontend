import { Canvas, FabricImage } from 'fabric';
import { useState } from 'react';

import {
  ColorPickerChange,
  ColorPickerValue,
} from '@/components/molecules/color-picker/components/colorPicker.types';

import { convertFabricColor } from '../utils/fabricUtils';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
}

export const useFabricBackground = ({ canvas, saveHistory }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState<ColorPickerValue>({
    h: 0,
    s: 0,
    v: 100,
    a: 1,
  });
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(1);

  const updateBackgroundColor = (
    color: ColorPickerChange | ColorPickerValue
  ) => {
    if (!canvas) return;

    const existingBg = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer');
    if (existingBg) {
      canvas.remove(existingBg);
    }

    canvas.set({
      backgroundColor: convertFabricColor(color),
      backgroundImage: null,
    });
    const nextColor =
      typeof color === 'object' && 'hsva' in color ? color.hsva : color;

    setBackgroundColor(nextColor);
    canvas.requestRenderAll();
    saveHistory();
  };

  const setBackgroundImage = async (base64: string) => {
    if (!canvas) return;

    try {
      const objects = canvas.getObjects();
      const existingBg = objects.find(
        obj => obj.get('id') === 'background-layer'
      ) as FabricImage | undefined;

      if (existingBg) {
        await existingBg.setSrc(base64);
        const scaleX = canvas.width / existingBg.width;
        const scaleY = canvas.height / existingBg.height;
        const scale = Math.max(scaleX, scaleY);
        existingBg.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: canvas.width / 2,
          top: canvas.height / 2,
          opacity: existingBg.opacity ?? backgroundImageOpacity,
        });
        existingBg.setCoords();
        canvas.requestRenderAll();
        saveHistory();
        return;
      }

      const img = await FabricImage.fromURL(base64);

      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.max(scaleX, scaleY);

      img.set({
        id: 'background-layer',
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
        opacity: backgroundImageOpacity,
        selectable: false,
        evented: false,
      });

      canvas.insertAt(0, img);
      canvas.requestRenderAll();
      saveHistory();
    } catch (error) {
      console.error('Failed to set background image:', error);
    }
  };

  const updateBackgroundImageOpacity = (opacity: number) => {
    if (!canvas) return;

    const existingBg = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer') as
      | FabricImage
      | undefined;

    setBackgroundImageOpacity(opacity);

    if (!existingBg) return;

    existingBg.set({ opacity });
    canvas.requestRenderAll();
    saveHistory();
  };

  return {
    backgroundColor,
    backgroundImageOpacity,
    updateBackgroundColor,
    setBackgroundImage,
    updateBackgroundImageOpacity,
  };
};
