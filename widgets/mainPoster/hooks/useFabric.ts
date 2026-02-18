/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fabric from 'fabric';
import { useState } from 'react';

import {
  LayoutStyle,
  RichStyle,
  Shape,
  Text,
  RichStyleKey,
  DragPoints,
  ActiveObject,
} from '../types/fabric';
import { initDragHandler } from '../utils/fabricUtils';

export const useFabric = () => {
  const [activeInfo, setActiveInfo] = useState<ActiveObject>({
    type: null,
    filters: [],
    styles: {},
  });

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeDrawingMode, setDrawingMode] = useState(false);

  const handleDrawingMode = () => {
    setDrawingMode(true);
  };

  const dragToCreateTextBox = (canvas: fabric.Canvas) =>
    initDragHandler({
      canvas,
      onComplete: (points: DragPoints) => {
        if (!activeDrawingMode) return;

        const { width, height, left, top } = points;

        if (width > 20 || height > 20) {
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

        setDrawingMode(false);
        canvas.requestRenderAll();
      },
    });

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

  // 이미지 관련 함수들(applyImageFilter, startCrop, applyCrop, cancelCrop, addImage) 제거됨

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

  const syncActiveObjectInfo = (canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      setActiveInfo({ type: null, filters: [], styles: {} });
      return;
    }

    // UI 버튼 활성화를 위해 필요한 정보만 추출
    setActiveInfo({
      type: activeObject.type,
      filters: (activeObject as any).filters || [],
      styles: {
        fontWeight: (activeObject as any).fontWeight,
        fill: activeObject.fill,
        fontSize: (activeObject as any).fontSize,
        // 여기에 필요한 스타일 속성 추가
      },
    });
  };

  // 캔버스 초기화 시 이벤트 리스너 등록
  const setupEventListeners = (canvas: fabric.Canvas) => {
    const events = [
      'selection:created',
      'selection:updated',
      'selection:cleared',
      'object:modified',
      'text:selection:changed', // 텍스트 내부 드래그 시 스타일 대응
    ];

    events.forEach(event => {
      canvas.on(event as any, () => syncActiveObjectInfo(canvas));
    });
  };

  return {
    activeInfo, // State 추가됨
    setupEventListeners,
    syncActiveObjectInfo,

    shapes,
    activeDrawingMode,
    setDrawingMode, // Export setDrawingMode for useFabricDiagram
    handleDrawingMode,
    dragToCreateTextBox,
    applyRichStyle,
    getRichStyles,

    // 이미지/크롭 관련 반환값 제거됨

    handleDeleteShape,
    handleDeleteEmptyShape,

    setPatternOffset,
    copy,
    paste,

    setShapes,
  };
};
