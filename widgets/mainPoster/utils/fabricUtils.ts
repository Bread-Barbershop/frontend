import { Canvas, FabricObject, TPointerEventInfo } from 'fabric';

import { ICON_PATHS, SIDES_CONFIG } from '../constants/fabric';
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

export const updateCropRatio = (canvas: Canvas, ratio: number | 'free') => {
  const cropZone = canvas
    .getObjects()
    .find(obj => (obj as FabricObject & { name: string }).name === 'crop-zone');

  if (!cropZone) {
    return;
  }

  const sideControls = SIDES_CONFIG.map((side: { id: string }) => side.id);

  // 1. 자유 조절 모드
  if (ratio === 'free') {
    cropZone.set({
      lockUniScaling: false, // 비례 제한 해제
    });

    // 모든 컨트롤 복구 (기본값에서 복사)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultControls = (FabricObject as any).ownDefaults.controls;
    cropZone.controls = { ...defaultControls };
  }
  // 2. 고정 비율 모드
  else {
    // 원본 이미지(ghost-image)를 찾아 최대 크기 제한 확인
    const ghostImg = canvas.getObjects().find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj => (obj as any).name === 'ghost-image'
    );

    let maxAllowedWidth = Infinity;
    let maxAllowedHeight = Infinity;

    if (ghostImg) {
      maxAllowedWidth = ghostImg.width * ghostImg.scaleX;
      maxAllowedHeight = ghostImg.height * ghostImg.scaleY;
    }

    // 현재 시각적 크기 계산 (Scale이 적용된 실제 화면상의 크기)
    // getScaledWidth()는 strokeWidth를 포함할 수 있어 반복 적용 시 크기가 증가할 수 있음.
    // 순수 기하학적 너비인 width * scaleX 사용.
    let currentVisualWidth = cropZone.width * cropZone.scaleX;
    let targetVisualHeight = currentVisualWidth / ratio;

    // 크기 제한 적용 (원본 이미지 범위를 벗어나지 않도록)
    if (currentVisualWidth > maxAllowedWidth) {
      currentVisualWidth = maxAllowedWidth;
      targetVisualHeight = currentVisualWidth / ratio;
    }

    if (targetVisualHeight > maxAllowedHeight) {
      targetVisualHeight = maxAllowedHeight;
      currentVisualWidth = targetVisualHeight * ratio;
    }

    // Scale Normalization (스케일 정규화)
    // Scale을 1로 초기화하고, width/height를 그에 맞게 명시적으로 설정하여
    // 이전의 비균등 스케일(Non-uniform scaling) 상태를 제거함.
    cropZone.set({
      width: currentVisualWidth,
      height: targetVisualHeight,
      scaleX: 1,
      scaleY: 1,
      lockUniScaling: true, // 정비례 잠금
    });

    // 상하좌우 컨트롤 숨김 (공유된 Control 인스턴스를 수정하지 않고, 맵에서 키를 제거함)
    // 1. 기본 컨트롤셋 복사
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultControls = (FabricObject as any).ownDefaults.controls;
    const newControls = { ...defaultControls };

    // 2. 사이드 컨트롤 키 제거
    sideControls.forEach((id: string) => {
      delete newControls[id];
    });

    // 3. 적용
    cropZone.controls = newControls;
  }

  cropZone.setCoords();
  canvas.requestRenderAll();
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
