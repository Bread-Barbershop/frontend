/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Canvas,
  FabricObject,
  Textbox,
  Shadow,
  IText,
  Pattern,
  ActiveSelection,
} from 'fabric';
import { useRef, useState } from 'react';

import {
  LayoutStyle,
  RichStyle,
  Text,
  RichStyleKey,
  DragPoints,
  ActiveObject,
} from '../types/fabric';
import { initDragHandler } from '../utils/fabricUtils';

export const useFabric = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeInfo, setActiveInfo] = useState<ActiveObject>({
    type: null,
    filters: [],
    styles: {},
  });
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUpdating = useRef<boolean>(false);

  const dragToCreateTextBox = (canvas: Canvas) => {
    if (dragCleanupRef.current) {
      dragCleanupRef.current();
    }

    dragCleanupRef.current = initDragHandler({
      canvas,
      onComplete: ({ width, height, left, top }: DragPoints) => {
        if (width > 20 || height > 20) {
          const newTextbox = new Textbox('텍스트를 입력해주세요', {
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

          newTextbox.enterEditing();
          newTextbox.selectAll();
        }

        dragCleanupRef.current = null;
        canvas.requestRenderAll();
      },
    });
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

  const applyRichStyle = (styleObj: RichStyle, canvas: Canvas) => {
    const activeObject = canvas.getActiveObject() as Textbox;
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
        : activeObject.get(key as keyof Textbox);

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
          shadow: new Shadow({
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
    saveHistory();
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
    activeObject: Textbox,
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

  const handleDeleteShape = (
    canvas: Canvas,
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
        obj => obj instanceof Textbox && obj.isEditing
      );

      if (isEditing) return;
      if (e?.key === 'Delete' || flag === true) {
        e?.preventDefault();

        canvas.remove(...activeObjects);

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

  const handleDeleteEmptyShape = (canvas: Canvas) => {
    const deleteEmptyShape = (opt: { target: IText }) => {
      const textObject = opt.target;

      if (textObject && textObject.isType('textbox')) {
        const trimmedText = textObject.text.trim();

        if (trimmedText.length === 0) {
          setTimeout(() => {
            if (!textObject) return;
            canvas.remove(textObject);

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
    canvas: Canvas,
    offsetX: number,
    offsetY: number
  ) => {
    const activeObject = canvas.getActiveObject() as Textbox;
    if (!activeObject) return;

    let patternUpdated = false;

    // 1. 전체 객체 레벨의 패턴 업데이트
    if (activeObject.fill instanceof Pattern) {
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
        if (style.fill instanceof Pattern) {
          style.fill.offsetX = offsetX;
          style.fill.offsetY = offsetY;
          patternUpdated = true;
        }
      });
    }

    if (patternUpdated) {
      // 강제 렌더링 갱신
      activeObject.dirty = true;
      saveHistory();
      canvas.requestRenderAll();
    }
  };

  const copy = async () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    const cloned = await activeObject.clone();
    setClipboard(cloned);
  };

  const paste = async () => {
    if (!clipboard || !canvas) return;
    const cloned = await clipboard.clone();
    if (!cloned) return;

    canvas.discardActiveObject();
    cloned.set({
      left: (cloned.left ?? 0) + 10,
      top: (cloned.top ?? 0) + 10,
      evented: true,
    });

    if (cloned instanceof ActiveSelection) {
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

  const syncActiveObjectInfo = (canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length === 0) {
      setActiveInfo({ type: null, filters: [], styles: {} });
      return;
    }

    const primaryObject = activeObjects[0];

    // UI 버튼 활성화를 위해 필요한 정보만 추출
    setActiveInfo({
      type: primaryObject.type,
      filters: (primaryObject as any).filters || [],
      styles: {
        fontWeight: (primaryObject as any).fontWeight,
        fill: primaryObject.fill,
        fontSize: (primaryObject as any).fontSize,
        textAlign: (primaryObject as any).textAlign,
        lineHeight: (primaryObject as any).lineHeight,
        charSpacing: (primaryObject as any).charSpacing,
        paintFirst: (primaryObject as any).paintFirst,
        stroke: primaryObject.stroke,
        strokeWidth: primaryObject.strokeWidth,
      },
    });
  };

  // 캔버스 초기화 시 이벤트 리스너 등록
  const setupEventListeners = (canvas: Canvas) => {
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

  const saveHistory = () => {
    if (isUpdating.current || !canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    const prevState = undoStack.current[undoStack.current.length - 1];
    if (prevState === json) return;
    undoStack.current.push(json);

    if (redoStack.current.length > 0) {
      redoStack.current.length = 0;
    }
  };

  const undo = async () => {
    if (undoStack.current.length <= 1 || isUpdating.current || !canvas) return;

    isUpdating.current = true;
    const current = undoStack.current.pop();
    if (current) redoStack.current.push(current);

    const prevState = undoStack.current[undoStack.current.length - 1];

    await canvas.loadFromJSON(prevState);
    canvas.requestRenderAll();
    isUpdating.current = false;
  };

  const redo = async () => {
    if (redoStack.current.length === 0 || isUpdating.current || !canvas) return;

    isUpdating.current = true;
    const nextState = redoStack.current.pop();
    if (nextState) {
      undoStack.current.push(nextState);
      await canvas.loadFromJSON(nextState);
      canvas.requestRenderAll();
    }
    isUpdating.current = false;
  };

  return {
    canvas,
    setCanvas,
    activeInfo,
    setupEventListeners,
    syncActiveObjectInfo,
    dragToCreateTextBox,
    applyRichStyle,
    getRichStyles,
    handleDeleteShape,
    handleDeleteEmptyShape,
    setPatternOffset,
    copy,
    paste,
    redo,
    undo,
    saveHistory,
  };
};
