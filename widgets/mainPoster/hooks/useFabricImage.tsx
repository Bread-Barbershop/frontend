import { Canvas, FabricImage, Rect, TPointerEventInfo } from 'fabric';
import { useRef, useState } from 'react';

import { FilterType } from '@/components/molecules/image-editor';

import { PhotoPreset } from '../libs/customImage-filter';
import { PhotoPresetOptions, FabricImageWithLock } from '../types/fabric';
import { updateCropRatio } from '../utils/fabricUtils';
import { SlotImageObject } from '../utils/imageSlot';

interface Props {
  syncActiveObjectInfo?: (canvas: Canvas) => void;
  saveHistory: () => void;
}

export const useFabricImage = ({
  syncActiveObjectInfo,
  saveHistory,
}: Props) => {
  const [isCropping, setIsCropping] = useState(false);
  const cropZoneRef = useRef<Rect | null>(null);
  const highlightLayerRef = useRef<FabricImage | null>(null);
  const darkOverlayRef = useRef<Rect | null>(null);
  const autoCropHandlerRef = useRef<((opt: TPointerEventInfo) => void) | null>(
    null
  );

  const escKeyHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const documentClickHandlerRef = useRef<((e: MouseEvent) => void) | null>(
    null
  );

  //사진 보정 필터
  const applyImageFilter = (
    options: PhotoPresetOptions,
    canvas: Canvas,
    type: FilterType
  ) => {
    const activeObject = canvas.getActiveObject() as FabricImageWithLock;
    if (!activeObject || activeObject.isLocked) return;

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

    saveHistory();
  };

  // 이미지 크롭 시작
  const startCrop = (canvas: Canvas, ratio?: number | 'free') => {
    // 1. 이미 크롭 중이라면 비율만 업데이트
    if (cropZoneRef.current && ratio) {
      updateCropRatio(canvas, ratio);
      return;
    }

    const activeObject = canvas.getActiveObject() as FabricImageWithLock;
    if (!activeObject || !activeObject.isType('image')) return;
    if (activeObject.isLocked) return;
    setIsCropping(true);

    const img = activeObject;
    const slot = (img as SlotImageObject).slot;
    const slotRatio =
      slot?.replaceable && img.getScaledHeight()
        ? img.getScaledWidth() / img.getScaledHeight()
        : null;
    // 이전에 적용되었던 비율 정보가 있다면 사용하고, 없다면 'free' 적용
    const activeRatio =
      slotRatio ||
      ratio ||
      (img as FabricImage & { customCropRatio?: string | number })
        .customCropRatio ||
      'free';

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
      evented: true,
      objectCaching: false,
      excludeFromExport: true,
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
      excludeFromExport: true,
    });

    // 원본 이미지 크기와 현재 가져보는 크기 비교하여 크롭 여부 판단
    const isCropped =
      img.cropX > 0 ||
      img.cropY > 0 ||
      img.width !== originalWidth ||
      img.height !== originalHeight;

    // 5. Control Layer (상단): 이전 크롭 영역 또는 초기 영역 표시 (Zone)
    // 크롭된 이미지라면 현재 크롭 영역의 크기를 유지하고, 아니면 0.7 비율로 생성
    const initialZoneWidth = isCropped
      ? currentWidth / currentScaleX
      : originalWidth * 0.7;
    const initialZoneHeight = isCropped
      ? currentHeight / currentScaleY
      : originalHeight * 0.7;

    const zone = new Rect({
      name: 'crop-zone',
      left: currentCenter.x,
      top: currentCenter.y,
      width: initialZoneWidth,
      height: initialZoneHeight,
      scaleX: currentScaleX,
      scaleY: currentScaleY,
      angle: currentAngle,
      fill: 'transparent',
      strokeWidth: 0,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      absolutePositioned: true,
      excludeFromExport: true,
    }) as Rect & { lockUniScaling?: boolean };

    // 컨트롤 설정 로직 개선 (Free Mode vs Fixed Mode)
    zone.controls = { ...zone.controls };
    zone.lockRotation = true; // 회전 비활성화

    // 제거할 컨트롤 목록
    const controlsToRemove = [
      'center',
      'mtr', // 기본 회전
      'tl_rotate',
      'tr_rotate',
      'bl_rotate',
      'br_rotate', // 커스텀 회전
    ];

    if (activeRatio !== 'free') {
      // 비율 고정 모드: 변 핸들 제거 및 uniScaling 잠금
      controlsToRemove.push('ml', 'mt', 'mr', 'mb');
      zone.lockUniScaling = true;
    } else {
      // 자유 모드: uniScaling 해제 (개별 축 조절 가능)
      zone.lockUniScaling = false;
    }

    controlsToRemove.forEach(key => {
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

    // 캔버스 내부 클릭 시 크롭 적용 (크롭 박스 외부 클릭 시)
    const onMouseDown = (opt: TPointerEventInfo) => {
      const target = opt.target;
      if (!target || target !== cropZoneRef.current) {
        applyCrop(canvas);
      }
    };
    autoCropHandlerRef.current = onMouseDown;
    canvas.on('mouse:down', onMouseDown);

    // ESC 키 누를 시 크롭 취소
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelCrop(canvas);
      }
    };
    escKeyHandlerRef.current = onKeyDown;
    document.addEventListener('keydown', onKeyDown);

    // 캔버스 완전 외부 클릭 시 크롭 취소
    const onDocumentMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-crop-controls="true"]')) {
        return;
      }

      const canvasEl = canvas.getElement();
      const container =
        canvasEl.parentElement || canvasEl.closest('.canvas-container');

      // 클릭된 대상이 캔버스 컨테이너 내부에 속하지 않는 경우 (진짜 캔버스 밖)
      if (container && !container.contains(e.target as Node)) {
        applyCrop(canvas);
      }
    };
    documentClickHandlerRef.current = onDocumentMouseDown;
    document.addEventListener('mousedown', onDocumentMouseDown);

    canvas.add(darkOverlay, highlightImg, zone);
    canvas.setActiveObject(zone);

    if (activeRatio !== 'free') {
      updateCropRatio(canvas, activeRatio as number | 'free');
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

    // 비율 모드였다면 결과 비율을 계산하여 저장
    const customRatio = (zone as Rect & { lockUniScaling?: boolean })
      .lockUniScaling
      ? (zone.width * zone.scaleX) / (zone.height * zone.scaleY)
      : 'free';

    (img as FabricImage & { customCropRatio?: string | number }).set({
      cropX: newCropX,
      cropY: newCropY,
      width: newWidthPx,
      height: newHeightPx,
      left: zoneCenter.x,
      top: zoneCenter.y,
      opacity: 1,
      selectable: true,
      evented: true,
      customCropRatio: customRatio,
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
    if (escKeyHandlerRef.current) {
      document.removeEventListener('keydown', escKeyHandlerRef.current);
      escKeyHandlerRef.current = null;
    }
    if (documentClickHandlerRef.current) {
      document.removeEventListener('mousedown', documentClickHandlerRef.current);
      documentClickHandlerRef.current = null;
    }

    setIsCropping(false);
    cropZoneRef.current = null;
    highlightLayerRef.current = null;
    darkOverlayRef.current = null;

    canvas.discardActiveObject();
    canvas.renderAll();

    if (syncActiveObjectInfo) {
      syncActiveObjectInfo(canvas);
    }

    saveHistory();
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
    if (escKeyHandlerRef.current) {
      document.removeEventListener('keydown', escKeyHandlerRef.current);
      escKeyHandlerRef.current = null;
    }
    if (documentClickHandlerRef.current) {
      document.removeEventListener('mousedown', documentClickHandlerRef.current);
      documentClickHandlerRef.current = null;
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

  async function compressImage(base64: string) {
    return new Promise<string>(resolve => {
      const img = new window.Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const MAX_SIZE = 1600;

        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/webp', 0.8);

        resolve(compressed);
      };

      img.src = base64;
    });
  }

  return {
    isCropping,
    applyImageFilter,
    startCrop,
    applyCrop,
    cancelCrop,
    addImage,
    compressImage,
  };
};
