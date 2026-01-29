import * as fabric from 'fabric';
import { useState } from 'react';

import { LayoutStyle, RichStyle, Shape, Text } from '../types/fabric';

export const useFabric = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeDrawingMode, setDrawingMode] = useState(false);

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

  const checkNumberValidity = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue < 1) {
      return false;
    }
    return true;
  };

  const handleNumberValidity = (styleObj: RichStyle) => {
    for (const [_key, value] of Object.entries(styleObj)) {
      if (typeof value === 'number') {
        if (!checkNumberValidity(value)) return false;
      }
    }
  };

  const applyRichStyle = (styleObj: RichStyle, canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;
    if (!activeObject) return;

    if (handleNumberValidity(styleObj)) return false;
    const isSelectionPresent =
      activeObject.selectionStart !== activeObject.selectionEnd ||
      !isLayoutStyle(styleObj);

    const finalStyle: RichStyle = {};
    (Object.keys(styleObj) as Array<keyof RichStyle>).forEach(key => {
      const nextValue = styleObj[key];

      const currentStyle = isSelectionPresent
        ? activeObject.getSelectionStyles()[0]?.[key]
        : activeObject.get(key as keyof fabric.Textbox);

      if (currentStyle === nextValue) {
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
    canvas.requestRenderAll();
  };

  const getFallbackValue = (key: string) => {
    switch (key) {
      case 'fontWeight':
        return 'normal';
      case 'fontStyle':
        return 'normal';
      case 'underline':
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
        return 1;
      // charSpacing 추가
      default:
        return '';
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

  // const updateShape = (id: string, attrs: ShapeUpdate) => {
  //   setShapes(prev =>
  //     prev.map(shape =>
  //       shape.id === id ? ({ ...shape, ...attrs } as Shape) : shape
  //     )
  //   );
  // };

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

  return {
    shapes,
    activeDrawingMode,
    handleDrawingMode,
    dragToCreateTextBox,
    applyRichStyle,
    handleDeleteShape,
    handleDeleteEmptyShape,
  };
};
