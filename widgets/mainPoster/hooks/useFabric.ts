import * as fabric from 'fabric';
import { useState } from 'react';

import {
  LayoutStyle,
  RichStyle,
  Shape,
  Text,
  Image,
  ImageFilterOptions,
} from '../types/fabric';

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
          splitByGrapheme: true, // 그래픽 단위 줄바꿈
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
      'textAlign' in style || 'lineHeight' in style || 'charSpacing' in style
    );
  };

  // shapes 배열에도 스타일링된 내용 업데이트해두기
  const applyRichStyle = (styleObj: RichStyle, canvas: fabric.Canvas) => {
    const activeObject = canvas.getActiveObject() as fabric.Textbox;

    if (isLayoutStyle(styleObj)) {
      activeObject.set(styleObj);
    } else {
      const isSelectionPresent =
        activeObject.selectionStart !== activeObject.selectionEnd;

      if (isSelectionPresent) {
        activeObject.setSelectionStyles(styleObj);
      } else {
        activeObject.set(styleObj);
      }
    }

    activeObject.dirty = true;
    canvas.requestRenderAll();
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
      if (e.key === 'Delete' || e.key === 'Backspace') {
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

  const applyImageFilter = (
    options: ImageFilterOptions,
    canvas: fabric.Canvas
  ) => {
    const activeObject = canvas.getActiveObject();

    if (!activeObject || !(activeObject instanceof fabric.FabricImage)) {
      return;
    }

    const filters: fabric.filters.BaseFilter<string, any>[] = [];

    if (options.brightness !== undefined) {
      filters.push(
        new fabric.filters.Brightness({ brightness: options.brightness })
      );
    }
    if (options.contrast !== undefined) {
      filters.push(new fabric.filters.Contrast({ contrast: options.contrast }));
    }
    if (options.saturation !== undefined) {
      filters.push(
        new fabric.filters.Saturation({ saturation: options.saturation })
      );
    }
    if (options.blur !== undefined) {
      filters.push(new fabric.filters.Blur({ blur: options.blur }));
    }
    if (options.pixelate !== undefined) {
      filters.push(
        new fabric.filters.Pixelate({ blocksize: options.pixelate })
      );
    }
    if (options.grayscale) {
      filters.push(new fabric.filters.Grayscale());
    }
    if (options.invert) {
      filters.push(new fabric.filters.Invert());
    }

    activeObject.filters = filters;
    activeObject.applyFilters();
    canvas.requestRenderAll();

    // Update state
    const id = activeObject.id;
    setShapes(prev =>
      prev.map(shape =>
        shape.id === id ? { ...shape, filters: { ...options } } : shape
      )
    );
  };

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
    addImage,
    applyImageFilter,
    handleDeleteShape,
    handleDeleteEmptyShape,
  };
};
