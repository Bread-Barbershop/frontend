/* eslint-disable @typescript-eslint/no-explicit-any */
import { Rect, Circle, Triangle, Canvas, PencilBrush } from 'fabric';
import { useRef } from 'react';

import { DragPoints } from '../types/fabric';
import { initDragHandler } from '../utils/fabricUtils';

const shapeCreators = {
  rect: (p: DragPoints, opts: any) =>
    new Rect({ ...opts, width: p.width, height: p.height }),
  circle: (p: DragPoints, opts: any) =>
    new Circle({ ...opts, radius: Math.max(p.width, p.height) / 2 }),
  triangle: (p: DragPoints, opts: any) =>
    new Triangle({ ...opts, width: p.width, height: p.height }),
  // 여기에 신규 도형을 한 줄만 추가하면 끝!
};

interface Props {
  setDrawingMode: (isDrawing: boolean) => void;
}

export const useFabricGraphic = ({ setDrawingMode }: Props) => {
  const activeHandlerCleanup = useRef<(() => void) | null>(null);
  const drawingListenerRef = useRef<((e: any) => void) | null>(null);

  const addDiagram = (
    canvas: Canvas,
    type: keyof typeof shapeCreators,
    options?: any
  ) => {
    // 기존 핸들러 있다면 제거 (중복 이벤트 방지)
    if (activeHandlerCleanup.current) {
      activeHandlerCleanup.current();
      activeHandlerCleanup.current = null;
    }

    const cleanup = initDragHandler({
      canvas,
      onComplete: pointer => {
        const creator = shapeCreators[type];
        const shape = creator(pointer, {
          left: pointer.left,
          top: pointer.top,
          stroke: 'black',
          strokeWidth: 2,
          ...options,
        });
        canvas.add(shape);
        canvas.setActiveObject(shape);

        // 완료 시 클린업 참조 해제
        activeHandlerCleanup.current = null;
      },
      // initDragHandler 내부에서 onFinalize 같은 콜백이 있다면 거기서도 null 처리를 할 수 있지만,
      // 현재 구조상 onComplete가 발생하면 이벤트가 해제되므로 여기서 null 처리.
      // 만약 사용자가 드래그를 취소하거나 다른 도구를 선택했을 때도 정리되어야 하므로
      // 새로운 addDiagram 호출 시 상단에서 cleanup을 먼저 호출하는 것이 핵심.
    });

    activeHandlerCleanup.current = cleanup;
  };

  const toggleDrawingMode = (canvas: Canvas, enable: boolean) => {
    canvas.isDrawingMode = enable;

    // 기존 리스너 제거
    if (drawingListenerRef.current) {
      canvas.off('path:created', drawingListenerRef.current);
      drawingListenerRef.current = null;
    }

    if (enable) {
      // 그리기 모드 활성화 시 기본 브러시 설정
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
      }
      const currentBrushWidth = canvas.freeDrawingBrush.width || 5;
      const currentBrushColor = canvas.freeDrawingBrush.color || '#000000';

      canvas.freeDrawingBrush.width = currentBrushWidth;
      canvas.freeDrawingBrush.color = currentBrushColor;

      // 한 번 그리고 나면 그리기 모드 해제
      const disableDrawingAfterPath = () => {
        canvas.isDrawingMode = false;
        setDrawingMode(false);
        canvas.requestRenderAll();
        // 실행 후 자기 자신 제거
        canvas.off('path:created', disableDrawingAfterPath);
        drawingListenerRef.current = null;
      };

      drawingListenerRef.current = disableDrawingAfterPath;
      canvas.on('path:created', disableDrawingAfterPath);
    }

    canvas.requestRenderAll();
  };

  const setBrushProperties = (canvas: Canvas, color: string, width: number) => {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = width;
    }
  };

  return {
    addDiagram,
    toggleDrawingMode,
    setBrushProperties,
  };
};
