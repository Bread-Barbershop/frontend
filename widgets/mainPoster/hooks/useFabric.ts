import * as fabric from 'fabric';
import { useState, useRef } from 'react';

import {
  LayoutStyle,
  RichStyle,
  Shape,
  Text,
  Image,
  PhotoPresetOptions,
  RichStyleKey,
} from '../types/fabric';
import { PhotoPreset } from '../utils/CustomImageFilter';
import { updateCropRatio } from '../utils/fabricUtils';

export const useFabric = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeDrawingMode, setDrawingMode] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const autoCropHandlerRef = useRef<
    ((opt: fabric.TPointerEventInfo) => void) | null
  >(null);
  const cropZoneRef = useRef<fabric.Rect | null>(null);
  const highlightLayerRef = useRef<fabric.FabricImage | null>(null);
  const darkOverlayRef = useRef<fabric.Rect | null>(null);

  const handleDrawingMode = () => {
    setDrawingMode(true);
  };

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

      if (width > 20) {
        const left = Math.min(startPoints.x, pointer.x);
        const top = Math.min(startPoints.y, pointer.y);

        const newTextbox = new fabric.Textbox('텍스트를 입력해주세요', {
          left,
          top,
          originX: 'left',
          originY: 'top',
          width,
          fontSize: 16,
          splitByGrapheme: true,
        });

        const newTextData: Text = {
          id: `text-${Date.now()}`,
          type: 'text',
          text: newTextbox.text,
          left,
          top,
          originX: 'left',
          originY: 'top',
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

  const isLayoutStyle = (style: RichStyle): style is LayoutStyle => {
    return (
      'textAlign' in style ||
      'lineHeight' in style ||
      'charSpacing' in style ||
      'shadow' in style
    );
  };

  const handleNumberValidity = (styleObj: RichStyle) => {
    for (const [key, value] of Object.entries(styleObj)) {
      if (
        key === 'fontSize' ||
        key === 'lineHeight' ||
        key === 'charSpacing' ||
        key === 'strokeWidth'
      ) {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue as number) || (numValue as number) < 1) return true;
      }
    }
    return false;
  };

  const applyRichStyle = (styleObj: RichStyle, canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;
    if (!activeObject) return;

    if (handleNumberValidity(styleObj)) return;

    const isSelectionPresent =
      activeObject.selectionStart !== activeObject.selectionEnd ||
      !isLayoutStyle(styleObj);

    const finalStyle: RichStyle = {};
    (Object.keys(styleObj) as Array<keyof RichStyle>).forEach(key => {
      const nextValue = styleObj[key];

      const currentStyle = isSelectionPresent
        ? activeObject.getSelectionStyles()[0]?.[key]
        : activeObject.get(key as keyof fabric.Textbox);

      if (
        key === 'fontSize' ||
        key === 'fontFamily' ||
        isLayoutStyle(styleObj)
      ) {
        finalStyle[key] = nextValue as never;
      } else if (currentStyle === nextValue) {
        finalStyle[key] = getFallbackValue(key) as never;
      } else {
        finalStyle[key] = nextValue as never;
      }
    });

    if (isLayoutStyle(styleObj)) {
      if (styleObj.shadow) {
        activeObject.set({
          shadow: new fabric.Shadow({
            ...activeObject.shadow,
            ...styleObj.shadow,
          }),
        });
      } else {
        activeObject.set(finalStyle);
      }
    } else {
      if (isSelectionPresent) {
        activeObject.setSelectionStyles(finalStyle);
      } else {
        activeObject.set(finalStyle);
      }
    }

    activeObject.dirty = true;
    activeObject.initDimensions();
    canvas.requestRenderAll();
  };

  const getFallbackValue = (key: string) => {
    switch (key) {
      case 'fontWeight':
        return 'normal';
      case 'fontStyle':
        return 'normal';
      case 'underline':
        return false;
      case 'linethrough':
        return false;
      case 'stroke':
        return null;
      case 'strokeWidth':
        return 0;
      case 'textAlign':
        return 'left';
      case 'fill':
        return 'balck';
      case 'textBackgroundColor':
        return null;
      case 'shadow':
        return null;
      case 'lineHeight':
        return 1.1;
      case 'fontSize':
        return 16;
      case 'charSpacing':
        return 100;
      //shadow 추가
      default:
        return '';
    }
  };

  const getRichStyles = <T extends RichStyleKey>(
    activeObject: fabric.Textbox,
    style: T,
    onChange: (value: string) => void
  ) => {
    if (!activeObject) return;

    const isSelectionPresent =
      activeObject.selectionStart !== activeObject.selectionEnd;

    const currentStyle = isSelectionPresent
      ? (activeObject.getSelectionStyles(
          activeObject.selectionStart,
          activeObject.selectionStart + 1
        )[0]?.[style] as string)
      : (activeObject.get(style) as string);

    if (currentStyle) {
      onChange(currentStyle);
    }
  };

  const deleteShape = ({
    idArray,
    id,
  }: {
    idArray?: string[];
    id?: string;
  }) => {
    if (idArray)
      setShapes(prev => prev.filter(shape => !idArray.includes(shape.id)));
    else if (id) setShapes(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteShape = (
    canvas: fabric.Canvas,
    e?: KeyboardEvent,
    flag?: boolean
  ) => {
    // 페이지 내의 포스터 캔버스가 아닌곳에서 키보드 이벤트 발생시 작동 중지
    const activeObjects = canvas.getActiveObjects();
    const isHoveringCanvas = canvas.elements.container.matches(':hover');
    if (!isHoveringCanvas && activeObjects.length === 0) return;
    const exist = activeObjects.length > 0 ? true : false;

    if (exist) {
      const isEditing = activeObjects.some(
        obj => obj instanceof fabric.Textbox && obj.isEditing
      );

      if (isEditing) return;
      if (e?.key === 'Delete' || flag === true) {
        e?.preventDefault();

        canvas.remove(...activeObjects);

        const idArray = activeObjects
          .map(obj => obj.id)
          .filter(Boolean) as string[];
        deleteShape({ idArray });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    } else if (!exist && e?.key === 'Backspace') {
      const checkGoToBack = confirm(
        '정말 뒤돌아가시겠습니까? 저장되지 않은 내역은 모두 사라집니다'
      );
      if (!checkGoToBack) {
        e.preventDefault();
      }
    }
  };

  const handleDeleteEmptyShape = (canvas: fabric.Canvas) => {
    const deleteEmptyShape = (opt: { target: fabric.IText }) => {
      const textObject = opt.target;

      if (textObject && textObject.isType('textbox')) {
        const trimmedText = textObject.text.trim();

        if (trimmedText.length === 0) {
          setTimeout(() => {
            if (!textObject) return;
            canvas.remove(textObject);
            const id = textObject.id;
            deleteShape({ id });

            canvas.discardActiveObject();
            canvas.requestRenderAll();
          }, 0);
        }
      }
    };

    canvas.on('text:editing:exited', deleteEmptyShape);

    return () => {
      canvas.off('text:editing:exited', deleteEmptyShape);
    };
  };

  const setPatternOffset = (
    canvas: fabric.Canvas,
    offsetX: number,
    offsetY: number
  ) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;
    if (!activeObject) return;

    let patternUpdated = false;

    // 1. 전체 객체 레벨의 패턴 업데이트
    if (activeObject.fill instanceof fabric.Pattern) {
      activeObject.fill.offsetX = offsetX;
      activeObject.fill.offsetY = offsetY;
      patternUpdated = true;
    }

    // 2. 선택 영역(글자별) 패턴 업데이트 (있는 경우)
    if (activeObject.isType('textbox') || activeObject.isType('itext')) {
      const styles = activeObject.getSelectionStyles(
        0,
        activeObject.text.length
      );
      styles.forEach(style => {
        if (style.fill instanceof fabric.Pattern) {
          style.fill.offsetX = offsetX;
          style.fill.offsetY = offsetY;
          patternUpdated = true;
        }
      });
    }

    if (patternUpdated) {
      // 강제 렌더링 갱신
      activeObject.dirty = true;
      canvas.requestRenderAll();
    }
  };

  //사진 보정 필터
  const applyImageFilter = (
    options: PhotoPresetOptions,
    canvas: fabric.Canvas
  ) => {
    const targetImage = isCropping
      ? (canvas
          .getObjects()
          .find(
            obj =>
              obj instanceof fabric.FabricImage &&
              (obj as unknown as { name: string }).name === 'ghost-image'
          ) as fabric.FabricImage)
      : (canvas.getActiveObject() as fabric.FabricImage);

    if (!targetImage || !(targetImage instanceof fabric.FabricImage)) {
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

    setShapes(prev =>
      prev.map(shape =>
        shape.id === targetImage.id ? { ...shape, filters: options } : shape
      )
    );
  };

  // 이미지 크롭 시작
  const startCrop = (canvas: fabric.Canvas, ratio?: number | 'free') => {
    // 1. 이미 크롭 중이라면 비율만 업데이트
    if (cropZoneRef.current && ratio) {
      updateCropRatio(canvas, ratio);
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.FabricImage)) return;

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
    const rad = fabric.util.degreesToRadians(currentAngle);
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
    const darkOverlay = new fabric.Rect({
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
    const highlightImg = new fabric.FabricImage(img.getElement(), {
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
    const zone = new fabric.Rect({
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
    }) as fabric.Rect & { lockUniScaling?: boolean };

    // Center 컨트롤 숨김
    // 주의: zone.controls.center.visible = false로 설정하면 전역 컨트롤 인스턴스가 수정되어 다른 객체에도 영향을 줌.
    // 따라서 controls 객체를 얕은 복사하여 인스턴스만의 controls를 만들고 key를 delete 해야 함.
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

      const localRad = fabric.util.degreesToRadians(-currentAngle);
      const localDx = dx * Math.cos(localRad) - dy * Math.sin(localRad);
      const localDy = dx * Math.sin(localRad) + dy * Math.cos(localRad);

      const clampedLocalDx = Math.max(-maxDeltaX, Math.min(maxDeltaX, localDx));
      const clampedLocalDy = Math.max(-maxDeltaY, Math.min(maxDeltaY, localDy));

      if (clampedLocalDx !== localDx || clampedLocalDy !== localDy) {
        const revRad = fabric.util.degreesToRadians(currentAngle);
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
    const onMouseDown = (opt: fabric.TPointerEventInfo) => {
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
  const applyCrop = (canvas: fabric.Canvas) => {
    const ghostImg = canvas
      .getObjects()
      .find(
        obj =>
          obj instanceof fabric.FabricImage &&
          (obj as unknown as { name: string }).name === 'ghost-image'
      ) as fabric.FabricImage;

    const zone = cropZoneRef.current;
    if (!ghostImg || !zone) return;

    const img = ghostImg;
    const originalAngle = img.angle;

    const imgCenter = img.getCenterPoint();
    const zoneCenter = zone.getCenterPoint();

    const dx = zoneCenter.x - imgCenter.x;
    const dy = zoneCenter.y - imgCenter.y;

    const rad = fabric.util.degreesToRadians(-originalAngle);
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

    setShapes(prev =>
      prev.map(s =>
        s.id === img.id
          ? {
              ...s,
              left: img.left,
              top: img.top,
              width: img.getScaledWidth(),
              height: img.getScaledHeight(),
            }
          : s
      )
    );
  };

  // 크롭 취소/정리
  const cancelCrop = (canvas: fabric.Canvas) => {
    const ghostImg = canvas
      .getObjects()
      .find(
        obj =>
          obj instanceof fabric.FabricImage &&
          (obj as unknown as { name: string }).name === 'ghost-image'
      ) as fabric.FabricImage;

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
  const addImage = async (url: string, canvas: fabric.Canvas) => {
    try {
      const img = await fabric.FabricImage.fromURL(url, {
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

      setShapes(prev => [
        ...prev,
        {
          id: img.id!,
          type: 'image',
          src: url,
          left: img.left!,
          top: img.top!,
          width: img.getScaledWidth(),
          height: img.getScaledHeight(),
          filters: {},
        } as Image,
      ]);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  };

  const copy = async ({
    activeObject,
    setClipboard,
  }: {
    activeObject: fabric.FabricObject | null;
    setClipboard: (clipboard: fabric.FabricObject | null) => void;
  }) => {
    if (!activeObject) return;
    const cloned = await activeObject.clone();
    setClipboard(cloned);
  };

  const paste = async ({
    canvas,
    clipboard,
  }: {
    canvas: fabric.Canvas;
    clipboard: fabric.FabricObject | null;
  }) => {
    if (!clipboard) return;
    const cloned = await clipboard.clone();
    if (!cloned) return;

    canvas.discardActiveObject();
    cloned.set({
      left: (cloned.left ?? 0) + 10,
      top: (cloned.top ?? 0) + 10,
      evented: true,
    });

    if (cloned instanceof fabric.ActiveSelection) {
      cloned.canvas = canvas;
      cloned.forEachObject(obj => canvas.add(obj));
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }

    canvas.setActiveObject(cloned);
    canvas.bringObjectForward(cloned);
    canvas.requestRenderAll();
  };

  // --- 도형 및 그리기 기능 ---

  // 도형 추가 (Rect, Circle, Triangle)
  const addShape = (
    canvas: fabric.Canvas,
    type: 'rect' | 'circle' | 'triangle',
    options?: fabric.FabricObjectProps
  ) => {
    let shape: fabric.FabricObject;
    const commonOptions = {
      left: 100,
      top: 100,
      fill: '#000000',
      width: 100,
      height: 100,
      ...options,
    };

    switch (type) {
      case 'rect':
        shape = new fabric.Rect(commonOptions);
        break;
      case 'circle':
        shape = new fabric.Circle({
          ...commonOptions,
          radius: (commonOptions.width || 100) / 2,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle(commonOptions);
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.requestRenderAll();
  };

  // 선 추가
  const addLine = (
    canvas: fabric.Canvas,
    options?: fabric.FabricObjectProps
  ) => {
    const line = new fabric.Line([50, 100, 250, 100], {
      left: 100,
      top: 100,
      stroke: '#000',
      strokeWidth: 5,
      ...options,
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  // 리스너 관리를 위해 useRef 사용
  const drawingListenerRef = useRef<
    ((e: fabric.TPointerEventInfo) => void) | null
  >(null);

  // 그리기 모드 토글 (수정됨)
  const toggleDrawingModeUpdated = (canvas: fabric.Canvas, enable: boolean) => {
    canvas.isDrawingMode = enable;

    // 기존 리스너 제거
    if (drawingListenerRef.current) {
      canvas.off('path:created', drawingListenerRef.current);
      drawingListenerRef.current = null;
    }

    if (enable) {
      // 그리기 모드 활성화 시 기본 브러시 설정
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
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

  // 브러시 속성 설정
  const setBrushProperties = (
    canvas: fabric.Canvas,
    color: string,
    width: number
  ) => {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = width;
    }
  };

  // --- Drag to Create Shape Logic ---
  const [activeShapeType, setActiveShapeType] = useState<
    'rect' | 'circle' | 'triangle' | 'line' | null
  >(null);
  const shapeCreationRef = useRef<{
    isDrawing: boolean;
    startPoint: { x: number; y: number };
    activeShape: fabric.Object | null;
  }>({
    isDrawing: false,
    startPoint: { x: 0, y: 0 },
    activeShape: null,
  });

  const activateShapeMode = (
    canvas: fabric.Canvas,
    type: 'rect' | 'circle' | 'triangle' | 'line' | null
  ) => {
    // 기존 모드 해제
    if (activeShapeType === type) {
      // 이미 활성화된 타입을 다시 누르면 취소
      setActiveShapeType(null);
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.off('mouse:down', onShapeMouseDown);
      canvas.off('mouse:move', onShapeMouseMove);
      canvas.off('mouse:up', onShapeMouseUp);
      return;
    }

    setActiveShapeType(type);

    if (type) {
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      canvas.on('mouse:down', onShapeMouseDown);
      canvas.on('mouse:move', onShapeMouseMove);
      canvas.on('mouse:up', onShapeMouseUp);
    } else {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
      canvas.off('mouse:down', onShapeMouseDown);
      canvas.off('mouse:move', onShapeMouseMove);
      canvas.off('mouse:up', onShapeMouseUp);
    }
  };

  const onShapeMouseDown = (opt: fabric.TPointerEventInfo) => {
    const canvas = opt.target?.canvas;
    if (!canvas || !activeShapeType) return;

    // 빈 공간 클릭시에만 생성 (객체 위 클릭은 무시하고 싶다면 activeObject 체크)
    // 하지만 "Drag to create"는 객체 위에서도 시작될 수 있어야 편할 수 있음.
    // 여기서는 selection을 껐으므로 객체 선택은 안됨.

    const pointer = canvas.getScenePoint(opt.e);
    shapeCreationRef.current.isDrawing = true;
    shapeCreationRef.current.startPoint = { x: pointer.x, y: pointer.y };

    let shape: fabric.Object;
    const commonOptions = {
      left: pointer.x,
      top: pointer.y,
      fill: '#000000', // 기본값
      selectable: false, // 생성 중에는 선택 불가
      evented: false,
    };

    switch (activeShapeType) {
      case 'rect':
        shape = new fabric.Rect({ ...commonOptions, width: 0, height: 0 });
        break;
      case 'circle':
        shape = new fabric.Circle({
          ...commonOptions,
          radius: 0,
          // Fabric Circle은 좌상단 기준이므로 radius조정 방식에 따라 origin 조정 필요
          // 여기서는 좌상단 클릭 -> 드래그로 반경 결정 방식으로 구현
          originX: 'left',
          originY: 'top',
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({ ...commonOptions, width: 0, height: 0 });
        break;
      case 'line':
        shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          ...commonOptions,
          fill: undefined,
          stroke: '#000000',
          strokeWidth: 5,
        });
        break;
      default:
        return;
    }

    if (shape) {
      canvas.add(shape);
      shapeCreationRef.current.activeShape = shape;
    }
  };

  const onShapeMouseMove = (opt: fabric.TPointerEventInfo) => {
    if (!shapeCreationRef.current.isDrawing) return;
    const canvas = opt.target?.canvas;
    const shape = shapeCreationRef.current.activeShape;
    if (!canvas || !shape) return;

    const pointer = canvas.getScenePoint(opt.e);
    const startPoint = shapeCreationRef.current.startPoint;

    if (activeShapeType === 'line') {
      (shape as fabric.Line).set({ x2: pointer.x, y2: pointer.y });
    } else if (activeShapeType === 'circle') {
      const dx = Math.abs(pointer.x - startPoint.x);
      const dy = Math.abs(pointer.y - startPoint.y);
      const radius = Math.max(dx, dy) / 2; // 지름의 절반
      // 드래그 방향에 따라 left/top 조정이 필요할 수 있음
      const left = Math.min(pointer.x, startPoint.x);
      const top = Math.min(pointer.y, startPoint.y);
      (shape as fabric.Circle).set({ radius: radius, left: left, top: top });
    } else {
      // Rect, Triangle
      const width = Math.abs(pointer.x - startPoint.x);
      const height = Math.abs(pointer.y - startPoint.y);
      const left = Math.min(pointer.x, startPoint.x);
      const top = Math.min(pointer.y, startPoint.y);
      shape.set({ width, height, left, top });
    }

    canvas.requestRenderAll();
  };

  const onShapeMouseUp = (opt: fabric.TPointerEventInfo) => {
    if (!shapeCreationRef.current.isDrawing) return;
    const canvas = opt.target?.canvas;
    const shape = shapeCreationRef.current.activeShape;
    if (!canvas || !shape) return;

    // 너무 작은 도형은 삭제 (클릭 실수 방지)
    if (shape.width! < 5 && shape.height! < 5 && activeShapeType !== 'line') {
      canvas.remove(shape);
    } else {
      shape.set({ selectable: true, evented: true });
      canvas.setActiveObject(shape);
    }

    if (activeShapeType === 'line') {
      // Line의 경우 길이 체크 등 추가 가능
      shape.set({ selectable: true, evented: true });
      canvas.setActiveObject(shape);
    }

    shapeCreationRef.current.isDrawing = false;
    shapeCreationRef.current.activeShape = null;

    // 도형 생성 완료 후 모드 자동 해제 (One-time creation)
    activateShapeMode(canvas, null);

    canvas.requestRenderAll();
  };

  return {
    shapes,
    activeDrawingMode,
    handleDrawingMode,
    dragToCreateTextBox,
    applyRichStyle,
    getRichStyles,
    addImage,
    applyImageFilter,
    handleDeleteShape,
    handleDeleteEmptyShape,
    isCropping,
    startCrop,
    applyCrop,
    cancelCrop,

    // Diagram functions
    addShape,
    addLine,
    toggleDrawingMode: toggleDrawingModeUpdated,
    setBrushProperties,
    activateShapeMode,
    activeShapeType,

    setPatternOffset,
    copy,
    paste,
  };
};
