import * as fabric from 'fabric';
import { useState } from 'react';

import { Shape, Text } from '../types/fabric';

export const useFabric = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeDrawingMode, setDrawingMode] = useState(false);

  const dragToCreateTextBox = (canvas: fabric.Canvas) => {
    let isDrawing = false;
    let startPoints = { x: 0, y: 0 };

    const removeEvents = () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:up', onMouseUp);
    };

    const onMouseDown = (opt: fabric.TPointerEventInfo) => {
      if (canvas.getActiveObject() || !activeDrawingMode) return;

      const pointer = canvas.getScenePoint(opt.e);
      isDrawing = true;
      startPoints = { x: pointer.x, y: pointer.y };
    };

    const onMouseUp = (opt: fabric.TPointerEventInfo) => {
      if (!isDrawing || !activeDrawingMode) return;

      const pointer = canvas.getScenePoint(opt.e);
      const width = Math.abs(startPoints.x - pointer.x);

      if (width > 30) {
        const left = Math.min(startPoints.x, pointer.x);
        const top = Math.min(startPoints.y, pointer.y);

        const newTextbox = new fabric.Textbox('텍스트를 입력해주세요', {
          left,
          top,
          width,
          fontSize: 16,
          splitByGrapheme: true, // 그래픽 단위 줄바꿈
        });

        const newTextData: Text = {
          id: `text-${Date.now()}`,
          type: 'text',
          text: newTextbox.text,
          left,
          top,
          width,
        };

        newTextbox.set({ id: newTextData.id });
        canvas.add(newTextbox);
        canvas.setActiveObject(newTextbox);

        setShapes(prev => [...prev, newTextData]);
        newTextbox.enterEditing();
        newTextbox.selectAll();
      }

      isDrawing = false;
      setDrawingMode(false);
      removeEvents();
      canvas.requestRenderAll();
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:up', onMouseUp);
  };

  const applyRichStyle = (styleObj: object, canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;

    if (activeObject && activeObject.isType('textbox')) {
      if (activeObject.isEditing) {
        // 드래그된 부분만 스타일 적용
        activeObject.setSelectionStyles(styleObj);
        activeObject.dirty = true;
      } else {
        // 전체 스타일 적용 (편집 모드가 아닐 때)
        activeObject.set(styleObj);
      }
      canvas.requestRenderAll();
    }
  };
  return {
    shapes,
    activeDrawingMode,
    setDrawingMode,
    applyRichStyle,
    dragToCreateTextBox,
  };
};
