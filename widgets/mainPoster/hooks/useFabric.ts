import * as fabric from 'fabric';
import { useState } from 'react';

import { Shape, Text } from '../types/fabric';

export const useFabric = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  // 텍스트 드래그 생성 모드 활성화 함수
  const dragToCreateTextBox = (canvas: fabric.Canvas) => {
    let isDrawing = false;
    let startPoints = { x: 0, y: 0 };
    let activeTextbox: fabric.Textbox | null = null;

    const onMouseDown = (opt: fabric.TPointerEventInfo) => {
      const pointer = canvas.getScenePoint(opt.e);
      if (canvas.getActiveObject()) return; // 다른 객체 선택 시 중단

      isDrawing = true;
      startPoints = { x: pointer.x, y: pointer.y };

      const textbox = new fabric.Textbox('', {
        left: pointer.x,
        top: pointer.y,
        width: 0,
        fontSize: 24,
        stroke: '#3b82f6',
        borderDashArray: [3, 3],
      });

      activeTextbox = textbox;
      canvas.add(textbox);
    };

    const onMouseMove = (opt: fabric.TPointerEventInfo) => {
      if (!isDrawing || !activeTextbox) return;
      const pointer = canvas.getScenePoint(opt.e);
      activeTextbox.set({ width: Math.abs(startPoints.x - pointer.x) });
      canvas.renderAll();
    };

    const onMouseUp = () => {
      if (!isDrawing || !activeTextbox) return;

      if (activeTextbox.width! < 10) {
        canvas.remove(activeTextbox);
      } else {
        const newText: Text = {
          id: `text-${Date.now()}`,
          type: 'text',
          text: '텍스트를 입력해주세요',
          left: activeTextbox.left,
          top: activeTextbox.top,
          width: activeTextbox.width,
        };
        activeTextbox.set({ id: newText.id });
        activeTextbox.set({ stroke: undefined, borderDashArray: undefined });
        canvas.setActiveObject(activeTextbox);
        setShapes(prev => [...prev, newText]);
        activeTextbox.enterEditing();
      }

      isDrawing = false;
      activeTextbox = null;
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  };

  const applyRichStyle = (styleObj: object, canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;

    if (activeObject && activeObject.isType('textbox')) {
      if (activeObject.isEditing) {
        // 드래그된 부분만 스타일 적용
        activeObject.setSelectionStyles(styleObj);
      } else {
        // 전체 스타일 적용 (편집 모드가 아닐 때)
        activeObject.set(styleObj);
      }
      canvas.requestRenderAll();
    }
  };
  return {
    shapes,
    applyRichStyle,
    dragToCreateTextBox,
  };
};
