/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, FabricObject, Textbox, IText, ActiveSelection } from 'fabric';
import { useRef, useState } from 'react';

import { ActiveObject } from '../types/fabric';
export const useFabric = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeInfo, setActiveInfo] = useState<ActiveObject>({
    type: null,
    filters: [],
    styles: {},
  });
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUpdating = useRef<boolean>(false);
  const MAX_STACK_SIZE = 30;

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

  const copy = async () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    const cloned = await activeObject.clone();
    setClipboard(cloned);
  };

  const paste = async () => {
    if (!clipboard || !canvas) return;
    isUpdating.current = true;

    const cloned = await clipboard.clone();
    if (!cloned) return;

    const dx = 10;
    const dy = 10;

    canvas.discardActiveObject();

    // 여러 객체일때만
    if (cloned instanceof ActiveSelection) {
      const pasted: FabricObject[] = [];

      cloned.forEachObject(obj => {
        obj.set({
          left: (obj.left ?? 0) + dx,
          top: (obj.top ?? 0) + dy,
          evented: true,
        });
        canvas.add(obj);
        pasted.push(obj);
      });

      const selection = new ActiveSelection(pasted, { canvas });
      canvas.setActiveObject(selection);

      pasted.forEach(o => {
        canvas.bringObjectForward(o);
      });

      canvas.requestRenderAll();
      isUpdating.current = false;
      saveHistory();
      return;
    }

    // 단일 객체
    cloned.set({
      left: (cloned.left ?? 0) + dx,
      top: (cloned.top ?? 0) + dy,
      evented: true,
    });

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.bringObjectForward(cloned);
    canvas.requestRenderAll();
    isUpdating.current = false;
    saveHistory();
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

    // 객체 상태 직렬화 시 filters 등 커스텀 속성도 포함
    const json = JSON.stringify(
      canvas.toObject(['filters', 'id', 'name', 'isLocked'])
    );

    const prevState = undoStack.current[undoStack.current.length - 1];
    if (prevState === json) return;

    undoStack.current.push(json);

    if (undoStack.current.length > MAX_STACK_SIZE) {
      undoStack.current.shift();
    }

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

    // 저장된 필터 효과를 다시 렌더링하도록 applyFilters 호출
    const objects = canvas.getObjects();
    for (const obj of objects) {
      if (
        obj.isType('image') &&
        'applyFilters' in obj &&
        (obj as any).filters?.length
      ) {
        (obj as any).applyFilters();
      }
    }

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

      // 저장된 필터 효과를 다시 렌더링하도록 applyFilters 호출
      const objects = canvas.getObjects();
      for (const obj of objects) {
        if (
          obj.isType('image') &&
          'applyFilters' in obj &&
          (obj as any & { filters?: any[] }).filters?.length
        ) {
          (obj as any).applyFilters();
        }
      }

      canvas.requestRenderAll();
    }
    isUpdating.current = false;
  };

  const exportIntersectedJSON = () => {
    if (!canvas) return;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const filteredData = canvas.getObjects().filter(obj => {
      obj.setCoords();

      const boundingRect = obj.getBoundingRect();

      const isVisible = !(
        boundingRect.left > canvasWidth ||
        boundingRect.top > canvasHeight ||
        boundingRect.left + boundingRect.width < 0 ||
        boundingRect.top + boundingRect.height < 0
      );

      return isVisible;
    });

    const propertiesToInclude = ['filters', 'id', 'name'];
    const json = canvas.toObject(propertiesToInclude);
    json.objects = filteredData.map(obj => obj.toObject(propertiesToInclude));
    return json;
  };

  return {
    canvas,
    setCanvas,
    activeInfo,
    setupEventListeners,
    syncActiveObjectInfo,
    handleDeleteShape,
    handleDeleteEmptyShape,
    copy,
    paste,
    redo,
    undo,
    saveHistory,
    exportIntersectedJSON,
  };
};
