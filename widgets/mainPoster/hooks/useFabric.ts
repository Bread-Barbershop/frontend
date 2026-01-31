import * as fabric from 'fabric';
import { useState } from 'react';

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

export const useFabric = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeDrawingMode, setDrawingMode] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropZone, setCropZone] = useState<fabric.Rect | null>(null);
  const [overlay, setOverlay] = useState<fabric.Rect | null>(null);
  const [croppingGroup, setCroppingGroup] = useState<fabric.Group | null>(null);

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

  const handleDeleteShape = (canvas: fabric.Canvas, e: KeyboardEvent) => {
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
      if (e.key === 'Delete') {
        e.preventDefault();

        canvas.remove(...activeObjects);

        const idArray = activeObjects
          .map(obj => obj.id)
          .filter(Boolean) as string[];
        deleteShape({ idArray });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    } else if (!exist && e.key === 'Backspace') {
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
      ? (croppingGroup?.getObjects()[0] as fabric.FabricImage)
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
    canvas.requestRenderAll();

    setShapes(prev =>
      prev.map(shape =>
        shape.id === targetImage.id ? { ...shape, filters: options } : shape
      )
    );
  };

  // 이미지 크롭 시작
  const startCrop = (canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.FabricImage)) return;

    setIsCropping(true);

    const imgWidth = activeObject.getScaledWidth();
    const imgHeight = activeObject.getScaledHeight();
    const center = activeObject.getCenterPoint();
    const imgLeft = center.x;
    const imgTop = center.y;
    const originalAngle = activeObject.angle;
    const GROUP_ID = 'cropping-group';

    // 오버레이 생성 (반투명 배경)
    const overlayRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: imgWidth,
      height: imgHeight,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
      angle: 0,
    });

    // 크롭 영역 상자 생성
    const zone = new fabric.Rect({
      name: 'crop-zone',
      left: imgLeft,
      top: imgTop,
      width: imgWidth * 0.8,
      height: imgHeight * 0.8,
      fill: 'transparent',
      stroke: 'white',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      borderColor: 'white',
      cornerColor: 'white',
      cornerStrokeColor: 'rgba(0,0,0,0.5)',
      cornerSize: 10,
      transparentCorners: false,
      originX: 'center',
      originY: 'center',
      angle: originalAngle,
    });

    // Editor.tsx에서 원본 이미지의 필터 정보를 찾기 위해 ID를 저장합니다.
    (zone as any).targetId = activeObject.id;

    // 이미지와 오버레이를 그룹화하기 전 이미지 상태 조절
    activeObject.set({
      left: 0,
      top: 0,
      angle: 0,
      originX: 'center',
      originY: 'center',
    });

    // 이미지와 오버레이를 그룹화
    const group = new fabric.Group([activeObject, overlayRect], {
      id: GROUP_ID,
      left: imgLeft,
      top: imgTop,
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
      angle: originalAngle,
    });

    // 기존 이미지를 캔버스에서 제거하고 그룹 추가
    canvas.remove(activeObject);
    canvas.add(group);

    // 크롭 영역이 이미지를 벗어나지 않도록 제한하는 로직
    const constrainPosition = () => {
      const currentWidth = zone.getScaledWidth();
      const currentHeight = zone.getScaledHeight();

      // 1. Scale 제어: 이미지를 넘지 않도록 크기 제한
      let newScaleX = zone.scaleX;
      let newScaleY = zone.scaleY;

      if (currentWidth > imgWidth) {
        newScaleX =
          (imgWidth / zone.width) *
          (zone.scaleX / (zone.getScaledWidth() / zone.width));
        // 간단하게 처리하기 위해 현재 너비 비율 사용
        newScaleX = (imgWidth / currentWidth) * zone.scaleX;
      }
      if (currentHeight > imgHeight) {
        newScaleY = (imgHeight / currentHeight) * zone.scaleY;
      }

      // 정비례 확대/축소 대응 (둘 중 더 작은 비율 적용)
      if (newScaleX !== zone.scaleX || newScaleY !== zone.scaleY) {
        const minScale = Math.min(newScaleX, newScaleY);
        zone.set({ scaleX: minScale, scaleY: minScale });
      }

      // 2. Position 제어: 로컬 좌표계(회전 고려) 기준 위치 제한
      const latestWidth = zone.getScaledWidth();
      const latestHeight = zone.getScaledHeight();

      const maxDeltaX = Math.max(0, (imgWidth - latestWidth) / 2);
      const maxDeltaY = Math.max(0, (imgHeight - latestHeight) / 2);

      const dx = zone.left - imgLeft;
      const dy = zone.top - imgTop;

      // 이미지의 회전 각도만큼 역회전시켜 로컬 좌표 구함
      const rad = fabric.util.degreesToRadians(-activeObject.angle);
      const localDx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localDy = dx * Math.sin(rad) + dy * Math.cos(rad);

      // 로컬 좌표 클램핑
      const clampedLocalDx = Math.max(-maxDeltaX, Math.min(maxDeltaX, localDx));
      const clampedLocalDy = Math.max(-maxDeltaY, Math.min(maxDeltaY, localDy));

      if (clampedLocalDx !== localDx || clampedLocalDy !== localDy) {
        // 클램핑된 로컬 좌표를 다시 월드 좌표로 변환
        const revRad = fabric.util.degreesToRadians(activeObject.angle);
        const newDx =
          clampedLocalDx * Math.cos(revRad) - clampedLocalDy * Math.sin(revRad);
        const newDy =
          clampedLocalDx * Math.sin(revRad) + clampedLocalDy * Math.cos(revRad);

        zone.set({
          left: imgLeft + newDx,
          top: imgTop + newDy,
        });
      }

      canvas.renderAll();
    };

    zone.on('moving', constrainPosition);
    zone.on('scaling', constrainPosition);

    canvas.add(zone);
    canvas.setActiveObject(zone);

    setOverlay(overlayRect);
    setCroppingGroup(group);
    setCropZone(zone);
    canvas.renderAll();
  };

  // 크롭 적용
  const applyCrop = (canvas: fabric.Canvas) => {
    const targetImage = croppingGroup?.getObjects()[0] as fabric.FabricImage;
    if (!targetImage || !cropZone || !croppingGroup) return;

    // 그룹 해제하여 이미지와 오버레이 좌표를 캔버스 기준으로 복원
    const objects = croppingGroup.getObjects();
    croppingGroup.removeAll();
    canvas.remove(croppingGroup);
    canvas.add(...objects);
    canvas.discardActiveObject();
    if (overlay) canvas.remove(overlay);

    // 이미지 대비 상대적인 좌표 계산
    const imgScaleX = targetImage.scaleX;
    const imgScaleY = targetImage.scaleY;

    const relativeLeft =
      (cropZone.left - targetImage.left) / imgScaleX + targetImage.cropX;
    const relativeTop =
      (cropZone.top - targetImage.top) / imgScaleY + targetImage.cropY;
    const relativeWidth = cropZone.getScaledWidth() / imgScaleX;
    const relativeHeight = cropZone.getScaledHeight() / imgScaleY;

    targetImage.set({
      cropX: relativeLeft,
      cropY: relativeTop,
      width: relativeWidth,
      height: relativeHeight,
      left: cropZone.left,
      top: cropZone.top,
    });

    cancelCrop(canvas);
    canvas.setActiveObject(targetImage);
    canvas.renderAll();

    setShapes(prev =>
      prev.map(s =>
        s.id === targetImage.id
          ? {
              ...s,
              left: targetImage.left,
              top: targetImage.top,
              width: targetImage.getScaledWidth(),
              height: targetImage.getScaledHeight(),
            }
          : s
      )
    );
  };

  // 크롭 취소/정리
  const cancelCrop = (canvas: fabric.Canvas) => {
    const targetImage = croppingGroup?.getObjects()[0] as fabric.FabricImage;
    if (croppingGroup && targetImage) {
      const groupMatrix = croppingGroup.calcTransformMatrix();
      const imgMatrix = targetImage.calcOwnMatrix();
      const absoluteMatrix = fabric.util.multiplyTransformMatrices(
        groupMatrix,
        imgMatrix
      );
      const transform = fabric.util.qrDecompose(absoluteMatrix);

      canvas.remove(croppingGroup);
      targetImage.set({
        left: transform.translateX,
        top: transform.translateY,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
        angle: transform.angle,
      });
      canvas.add(targetImage);
    }
    if (overlay) canvas.remove(overlay);
    if (cropZone) canvas.remove(cropZone);

    setIsCropping(false);
    setCropZone(null);
    setOverlay(null);
    setCroppingGroup(null);
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
    setPatternOffset,
  };
};
