import { Canvas, FabricImage, Rect, TPointerEventInfo } from 'fabric';
import { useRef, useState } from 'react';

import { PhotoPresetOptions } from '../types/fabric';
import { PhotoPreset } from '../utils/CustomImageFilter';
import { updateCropRatio } from '../utils/fabricUtils';

interface UseFabricImageProps {
  syncActiveObjectInfo?: (canvas: Canvas) => void;
}

export const useFabricImage = ({
  syncActiveObjectInfo,
}: UseFabricImageProps) => {
  const [isCropping, setIsCropping] = useState(false);
  const cropZoneRef = useRef<Rect | null>(null);
  const highlightLayerRef = useRef<FabricImage | null>(null);
  const darkOverlayRef = useRef<Rect | null>(null);
  const autoCropHandlerRef = useRef<((opt: TPointerEventInfo) => void) | null>(
    null
  );

  //사진 보정 필터
  const applyImageFilter = (
    options: PhotoPresetOptions,
    canvas: Canvas,
    type: 'bw' | 'warm' | 'cool' | 'fade' | 'filmGrain' | 'vignette' | null
  ) => {
    const targetImage = isCropping
      ? (canvas
          .getObjects()
          .find(
            obj =>
              obj instanceof FabricImage &&
              (obj as unknown as { name: string }).name === 'ghost-image'
          ) as FabricImage)
      : (canvas.getActiveObject() as FabricImage);

    if (!targetImage || !(targetImage instanceof FabricImage)) {
      return;
    }

    const photoFilter = new PhotoPreset({
      exposure: options.exposure ?? 50,
      contrast: options.contrast ?? 50,
      saturation: options.saturation ?? 50,
      temperature: options.temperature ?? 50,
      tint: options.tint ?? 50,
      fade: options.fade ?? 0,
      vignette: options.vignette ?? 0,
      grain: options.grain ?? 0,
      bw: options.bw ?? 0,
      type: type,
    });

    targetImage.filters = [photoFilter];
    targetImage.applyFilters();

    // 크롭 모드일 경우 하이라이트 레이어에도 필터 적용 (프리뷰)
    if (isCropping) {
      const highlightImg = highlightLayerRef.current;
      if (highlightImg) {
        highlightImg.filters = [photoFilter];
        highlightImg.applyFilters();
      }
    }

    canvas.requestRenderAll();

    if (syncActiveObjectInfo) {
      syncActiveObjectInfo(canvas);
    }
  };

  // 이미지 크롭 시작
  const startCrop = (canvas: Canvas, ratio?: number | 'free') => {
    // 1. 이미 크롭 중이라면 비율만 업데이트
    if (cropZoneRef.current && ratio) {
      updateCropRatio(canvas, ratio);
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof FabricImage)) return;

    setIsCropping(true);

    const img = activeObject;
    const originalWidth = img.getElement().width;
    const originalHeight = img.getElement().height;
    const currentAngle = img.angle;
    const currentScaleX = img.scaleX;
    const currentScaleY = img.scaleY;

    // 0. 현재 상태 캡처 (재크롭 시 영역 유지를 위함)
    const currentWidth = img.getScaledWidth();
    const currentHeight = img.getScaledHeight();
    const currentCenter = img.getCenterPoint();

    // 1. 현재 잘린 영역의 중심에서 원본 이미지의 중심으로 이동하는 벡터 계산 (이미지 좌표계)
    const currentCenterInOriginal = {
      x: img.cropX + img.width / 2,
      y: img.cropY + img.height / 2,
    };
    const vectorToFullCenter = {
      x: originalWidth / 2 - currentCenterInOriginal.x,
      y: originalHeight / 2 - currentCenterInOriginal.y,
    };

    // 2. 벡터를 월드 좌표계로 변환 (스케일 및 회전 적용)
    // fabric.util.degreesToRadians가 deprecated 되었을 수 있으므로 확인 필요하지만,
    // 기존 코드에서 사용 중이었으므로 그대로 사용하거나 Math.PI/180 곱하기로 대체 가능.
    // 여기서는 기존 코드 컨벤션 따름 (fabric 6.x에서는 util namespace 확인 필요)
    // fabric.util.degreesToRadians -> fabric.util.toRadians (fabric 6) or keep using if available.
    // To be safe and minimal change:
    const rad = (currentAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const worldDx =
      (vectorToFullCenter.x * cos - vectorToFullCenter.y * sin) * currentScaleX;
    const worldDy =
      (vectorToFullCenter.x * sin + vectorToFullCenter.y * cos) * currentScaleY;

    const fullLeft = img.left + worldDx;
    const fullTop = img.top + worldDy;

    // 3. Ghost Layer (하단): 원본 전체 이미지 (Overlay와 겹쳐서 어둡게 표현될 예정)
    img.set({
      left: fullLeft,
      top: fullTop,
      width: originalWidth,
      height: originalHeight,
      cropX: 0,
      cropY: 0,
      opacity: 1, // Dark Overlay가 위를 덮을 것이므로 원본은 선명하게 둡니다.
      selectable: false,
      evented: false,
    });
    (img as unknown as { name: string }).name = 'ghost-image';
    img.setCoords();

    // 3.5 Dark Overlay Layer (중간 1): 검은색 반투명 레이어로 배경을 어둡게 처리
    const darkOverlay = new Rect({
      name: 'dark-overlay',
      left: fullLeft,
      top: fullTop,
      width: originalWidth,
      height: originalHeight,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      angle: currentAngle,
      fill: 'black',
      opacity: 0.6, // 주변 어둡기 농도 (0.0 ~ 1.0)
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    // 4. Highlight Layer (중간): 선명하게 보일 이미지 (원본 전체)
    const highlightImg = new FabricImage(img.getElement(), {
      left: fullLeft,
      top: fullTop,
      angle: currentAngle,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      width: originalWidth,
      height: originalHeight,
      cropX: 0,
      cropY: 0,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      objectCaching: false,
      name: 'highlight-layer',
    });

    // 5. Control Layer (상단): 이전 크롭 영역 또는 초기 영역 표시 (Zone)
    const zone = new Rect({
      name: 'crop-zone',
      left: currentCenter.x,
      top: currentCenter.y,
      width: (currentWidth / currentScaleX) * 0.8,
      height: (currentHeight / currentScaleY) * 0.8,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      angle: currentAngle,
      fill: 'transparent',
      strokeWidth: 0, // 경계 계산 오차 방지를 위해 스트로크 제거 (Visual은 selection border로 처리)
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      absolutePositioned: true,
    }) as Rect & { lockUniScaling?: boolean };

    // Center 컨트롤 숨김
    zone.controls = { ...zone.controls };

    // Center 컨트롤 제거
    if (zone.controls.center) {
      delete zone.controls.center;
    }

    // 회전 컨트롤 제거 (커스텀 컨트롤)
    ['tl_rotate', 'tr_rotate', 'bl_rotate', 'br_rotate'].forEach(key => {
      if (zone.controls[key]) {
        delete zone.controls[key];
      }
    });

    highlightImg.clipPath = zone;

    const constrainPosition = () => {
      const imgScaledWidth = originalWidth * currentScaleX;
      const imgScaledHeight = originalHeight * currentScaleY;

      // getScaledWidth() 대신 순수 기하학적 크기 사용 (stroke 제외)
      const zoneWidth = zone.width * zone.scaleX;
      const zoneHeight = zone.height * zone.scaleY;

      // Scale 제한
      let newScaleX = zone.scaleX;
      let newScaleY = zone.scaleY;

      if (zoneWidth > imgScaledWidth) newScaleX = imgScaledWidth / zone.width;
      if (zoneHeight > imgScaledHeight)
        newScaleY = imgScaledHeight / zone.height;

      // 비율 고정 모드(Fixed Ratio)와 자유 모드(Free) 분기 처리
      if (zone.lockUniScaling) {
        // 고정 비율이면 둘 중 더 작은 스케일에 맞춰 비율 유지
        if (newScaleX !== zone.scaleX || newScaleY !== zone.scaleY) {
          const minScale = Math.min(newScaleX, newScaleY);
          zone.set({ scaleX: minScale, scaleY: minScale });
        }
      } else {
        // 자유 모드면 각 축을 독립적으로 제한 (사이드 리사이징 시 다른 축 영향 스킵)
        if (newScaleX !== zone.scaleX) zone.set({ scaleX: newScaleX });
        if (newScaleY !== zone.scaleY) zone.set({ scaleY: newScaleY });
      }

      // Position 제한
      // getScaledWidth() 대신 순수 기하학적 크기 사용 (stroke 제외)
      const latestWidth = zone.width * zone.scaleX;
      const latestHeight = zone.height * zone.scaleY;

      const maxDeltaX = Math.max(0, (imgScaledWidth - latestWidth) / 2);
      const maxDeltaY = Math.max(0, (imgScaledHeight - latestHeight) / 2);

      const dx = zone.left - fullLeft;
      const dy = zone.top - fullTop;

      const localRad = (-currentAngle * Math.PI) / 180;
      const localDx = dx * Math.cos(localRad) - dy * Math.sin(localRad);
      const localDy = dx * Math.sin(localRad) + dy * Math.cos(localRad);

      const clampedLocalDx = Math.max(-maxDeltaX, Math.min(maxDeltaX, localDx));
      const clampedLocalDy = Math.max(-maxDeltaY, Math.min(maxDeltaY, localDy));

      if (clampedLocalDx !== localDx || clampedLocalDy !== localDy) {
        const revRad = (currentAngle * Math.PI) / 180;
        zone.set({
          left:
            fullLeft +
            (clampedLocalDx * Math.cos(revRad) -
              clampedLocalDy * Math.sin(revRad)),
          top:
            fullTop +
            (clampedLocalDx * Math.sin(revRad) +
              clampedLocalDy * Math.cos(revRad)),
        });
      }

      highlightImg.dirty = true;
      canvas.requestRenderAll();
    };

    zone.on('moving', constrainPosition);
    zone.on('scaling', constrainPosition);

    // 자동 크롭 이벤트 (영역 외부 클릭 시)
    const onMouseDown = (opt: TPointerEventInfo) => {
      const target = opt.target;
      if (!target || target !== cropZoneRef.current) {
        applyCrop(canvas);
      }
    };
    autoCropHandlerRef.current = onMouseDown;
    canvas.on('mouse:down', onMouseDown);

    canvas.add(darkOverlay, highlightImg, zone);
    canvas.setActiveObject(zone);

    if (ratio) {
      updateCropRatio(canvas, ratio);
    }

    cropZoneRef.current = zone;
    highlightLayerRef.current = highlightImg;
    darkOverlayRef.current = darkOverlay;
    canvas.requestRenderAll();
  };

  // 크롭 적용
  const applyCrop = (canvas: Canvas) => {
    const ghostImg = canvas
      .getObjects()
      .find(
        obj =>
          obj instanceof FabricImage &&
          (obj as unknown as { name: string }).name === 'ghost-image'
      ) as FabricImage;

    const zone = cropZoneRef.current;
    if (!ghostImg || !zone) return;

    const img = ghostImg;
    const originalAngle = img.angle;

    const imgCenter = img.getCenterPoint();
    const zoneCenter = zone.getCenterPoint();

    const dx = zoneCenter.x - imgCenter.x;
    const dy = zoneCenter.y - imgCenter.y;

    const rad = (-originalAngle * Math.PI) / 180;
    const localDx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const localDy = dx * Math.sin(rad) + dy * Math.cos(rad);

    const newWidthPx = zone.getScaledWidth() / img.scaleX;
    const newHeightPx = zone.getScaledHeight() / img.scaleY;
    const localDxPx = localDx / img.scaleX;
    const localDyPx = localDy / img.scaleY;

    const newCropX = img.cropX + img.width / 2 + localDxPx - newWidthPx / 2;
    const newCropY = img.cropY + img.height / 2 + localDyPx - newHeightPx / 2;

    img.set({
      cropX: newCropX,
      cropY: newCropY,
      width: newWidthPx,
      height: newHeightPx,
      left: zoneCenter.x,
      top: zoneCenter.y,
      opacity: 1,
      selectable: true,
      evented: true,
    });

    img.setCoords();
    (img as unknown as { name: string }).name = '';

    // 레이어 정리
    if (highlightLayerRef.current) canvas.remove(highlightLayerRef.current);
    if (cropZoneRef.current) canvas.remove(cropZoneRef.current);
    if (darkOverlayRef.current) canvas.remove(darkOverlayRef.current);

    // 이벤트 리스너 제거 (자동 크롭 등)
    if (autoCropHandlerRef.current) {
      canvas.off('mouse:down', autoCropHandlerRef.current);
      autoCropHandlerRef.current = null;
    }

    setIsCropping(false);
    cropZoneRef.current = null;
    highlightLayerRef.current = null;
    darkOverlayRef.current = null;

    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // 크롭 취소/정리
  const cancelCrop = (canvas: Canvas) => {
    const ghostImg = canvas
      .getObjects()
      .find(
        obj =>
          obj instanceof FabricImage &&
          (obj as unknown as { name: string }).name === 'ghost-image'
      ) as FabricImage;

    if (ghostImg) {
      (ghostImg as unknown as { name: string }).name = '';
      ghostImg.set({
        opacity: 1,
        selectable: true,
        evented: true,
      });
    }

    if (highlightLayerRef.current) canvas.remove(highlightLayerRef.current);
    if (cropZoneRef.current) canvas.remove(cropZoneRef.current);
    if (darkOverlayRef.current) canvas.remove(darkOverlayRef.current);

    // 이벤트 리스너 제거
    if (autoCropHandlerRef.current) {
      canvas.off('mouse:down', autoCropHandlerRef.current);
      autoCropHandlerRef.current = null;
    }

    setIsCropping(false);
    cropZoneRef.current = null;
    highlightLayerRef.current = null;
    darkOverlayRef.current = null;
    canvas.renderAll();
  };

  // 이미지 추가
  const addImage = async (url: string, canvas: Canvas) => {
    try {
      const img = await FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      });

      // 초기 이미지 크기 최적화 - 캔버스 절반 크기로 제한
      const maxWidth = canvas.width ? canvas.width / 2 : 300;
      if (img.width > maxWidth) {
        img.scaleToWidth(maxWidth);
      }

      // 로드된 이미지가 화면 중앙에 위치하도록 설정
      img.set({
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
        id: `image-${Date.now()}`,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      if (syncActiveObjectInfo) {
        syncActiveObjectInfo(canvas);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  return {
    isCropping,
    applyImageFilter,
    startCrop,
    applyCrop,
    cancelCrop,
    addImage,
  };
};
