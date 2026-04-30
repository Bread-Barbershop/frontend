import { Canvas, FabricImage } from 'fabric';
import { useState } from 'react';

import { ColorPickerChange, ColorPickerValue } from '@/components/molecules/color-picker/components/colorPicker.types';

import { convertFabricColor } from '../utils/fabricUtils';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
}
export const useFabricBackground = ({ canvas, saveHistory }: Props) => {
  const [backgroundColor, setBackgroundColor] = useState<ColorPickerValue>({
    h: 0,
    s: 0,
    v: 0,
    a: 1,
  });

  const updateBackgroundColor = (color: ColorPickerChange | ColorPickerValue) => {
    if (!canvas) return;

    // 기존 배경 이미지 객체 제거
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
      ) as FabricImage;

      if (existingBg) {
        // 기존 배경이 있으면 소스만 교체
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
        });
        existingBg.setCoords();
        canvas.requestRenderAll();
        saveHistory();
        return;
      }

      // 새 배경 이미지 생성
      const img = await FabricImage.fromURL(base64);

      // 캔버스 크기에 맞춰 이미지 스케일링 (Cover)
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
        selectable: false, // 기본적으로 선택 불가 (배경 탭에서 제어)
        evented: false,
      });

      canvas.insertAt(0, img);
      canvas.requestRenderAll();
      saveHistory();
    } catch (error) {
      console.error('Failed to set background image:', error);
    }
  };

  return {
    backgroundColor,
    updateBackgroundColor,
    setBackgroundImage,
  };
};
