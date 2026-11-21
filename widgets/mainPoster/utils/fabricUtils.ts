import { hsvaToHex, hsvaToRgba } from '@uiw/color-convert';
import { Canvas, Textbox, TPointerEventInfo } from 'fabric';

import { ColorPickerChange, ColorPickerValue } from '@/components/molecules/color-picker/components/colorPicker.types';

import { ICON_PATHS } from '../constants/fabric';
import { DragPoints } from '../types/fabric';

/**
 * SVG 문자열을 Data URL로 변환합니다.
 * utf8 인코딩을 사용하여 브라우저 호환성 및 Base64 인코딩 오류를 방지합니다.
 */
export const createSvgDataUrl = (svgString: string): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};

/**
 * Fabric 컨트롤에서 사용할 HTMLImageElement를 생성하고 로드합니다.
 */
export const createFabricControlImage = (
  svgString: string,
  onReady?: () => void
): HTMLImageElement => {
  const img = new Image();
  img.onload = () => {
    if (onReady) onReady();
  };
  img.src = createSvgDataUrl(svgString);
  return img;
};

/**
 * CanvasRenderingContext2D.drawImage를 안전하게 호출하기 위한 검사 함수입니다.
 * 이미지가 로드 완료되었고 'broken' 상태가 아닌지 확인합니다.
 */
export const isImageReadyForCanvas = (img: HTMLImageElement): boolean => {
  return img.complete && img.naturalWidth > 0;
};

/**
 * Fabric 컨트롤에서 사용할 HTMLImageElement를 생성하고 로드합니다.
 */
export const getRotatedCursorUrl = (angle: number) => {
  // 아이콘 크기(17x17)를 고려해 32x32 공간의 정중앙에 배치(7.5, 7.5 이동)하고 회전시킵니다.
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${angle}, 16, 16) translate(7.5, 7.5)">
        ${ICON_PATHS}
      </g>
    </svg>
  `.trim();

  return `url('${createSvgDataUrl(svg)}') 16 16, auto`;
};

// 드래그 시작점 설정
export const initDragHandler = ({
  canvas,
  onComplete,
  onFinalize,
}: {
  canvas: Canvas;
  onComplete: (points: DragPoints) => void;
  onFinalize?: () => void;
}) => {
  let isDrawing = false;
  let startPoint = { x: 0, y: 0 };

  // 커서 설정 변경 ('')
  const defaultCursorInternal = canvas.defaultCursor;
  const hoverCursorInternal = canvas.hoverCursor;

  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  canvas.requestRenderAll();

  const cleanupCursor = () => {
    canvas.defaultCursor = defaultCursorInternal;
    canvas.hoverCursor = hoverCursorInternal;
  };

  const onMouseDown = (opt: TPointerEventInfo) => {
    if (canvas.getActiveObject()) {
      return;
    }
    const pointer = canvas.getScenePoint(opt.e);
    isDrawing = true;
    startPoint = { x: pointer.x, y: pointer.y };
  };

  const onMouseUp = (opt: TPointerEventInfo) => {
    if (!isDrawing) {
      return;
    }

    const pointer = canvas.getScenePoint(opt.e);
    const points: DragPoints = {
      left: Math.min(startPoint.x, pointer.x),
      top: Math.min(startPoint.y, pointer.y),
      width: Math.abs(startPoint.x - pointer.x),
      height: Math.abs(startPoint.y - pointer.y),
      startX: startPoint.x,
      startY: startPoint.y,
      endX: pointer.x,
      endY: pointer.y,
    };

    // 최소 드래그 거리 검증 (너무 작은 클릭 방지)
    if (points.width > 5 || points.height > 5) {
      onComplete(points);
    }

    isDrawing = false;
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:up', onMouseUp);
    cleanupCursor(); // 커서 복구
    if (onFinalize) onFinalize();
    canvas.requestRenderAll();
  };

  canvas.on('mouse:down', onMouseDown);
  canvas.on('mouse:up', onMouseUp);

  // 클린업 함수 반환
  return () => {
    canvas.off('mouse:down', onMouseDown);
    canvas.off('mouse:up', onMouseUp);
    cleanupCursor(); // 커서 복구
    canvas.requestRenderAll();
  };
};

export const convertFabricColor = (color: ColorPickerChange | ColorPickerValue) => {
  if (typeof color === 'string') return color;

  if ('hsva' in color) {
    if (color.hsva.a >= 1) {
      return color.hex;
    }
    const { r, g, b, a } = hsvaToRgba(color.hsva);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  if (color.a >= 1) {
    return hsvaToHex(color);
  }
  const { r, g, b, a } = hsvaToRgba(color);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Fabric 객체가 텍스트(Textbox 또는 IText) 객체인지 확인하는 타입 가드 함수입니다.
 * getSelectionStyles 메서드가 존재하는지도 함께 검증하여 텍스트 메서드 호출 시 런타임 오류를 방지합니다.
 */
export const isTextboxObject = (target?: unknown): target is Textbox => {
  if (!target || typeof target !== 'object') return false;
  const obj = target as {
    isType?: (type: string) => boolean;
    type?: string;
    getSelectionStyles?: unknown;
  };
  const isTextType =
    typeof obj.isType === 'function'
      ? obj.isType('textbox') || obj.isType('itext')
      : obj.type === 'textbox' || obj.type === 'itext';

  return isTextType && typeof obj.getSelectionStyles === 'function';
};
