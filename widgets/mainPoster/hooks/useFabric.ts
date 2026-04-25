/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, FabricObject, Textbox, IText, ActiveSelection } from 'fabric';
import { useCallback, useRef, useState } from 'react';

import { ActiveObject } from '../types/fabric';
export const useFabric = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeInfo, setActiveInfo] = useState<ActiveObject>({
    type: null,
    isLocked: false,
    filters: [],
    styles: {},
  });
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUpdating = useRef<boolean>(false);
  const MAX_STACK_SIZE = 30;

  const saveHistory = useCallback(() => {
    if (isUpdating.current || !canvas) return;

    // 객체 상태 직렬화 시 filters 등 커스텀 속성 및 잠금 관련 속성 포함
    const json = JSON.stringify(
      canvas.toObject([
        'filters',
        'id',
        'name',
        'isLocked',
        'lockMovementX',
        'lockMovementY',
        'lockScalingX',
        'lockScalingY',
        'lockRotation',
        'hasControls',
        'editable',
        'selectable',
        'evented',
      ])
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

    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, [canvas]);

  const handleDeleteShape = useCallback(
    (canvas: Canvas, e?: KeyboardEvent, flag?: boolean) => {
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
          e?.preventDefault();
        }
      }
    },
    []
  );

  const handleDeleteEmptyShape = useCallback((canvas: Canvas) => {
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
  }, []);

  const copy = useCallback(async () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    const cloned = await activeObject.clone();
    setClipboard(cloned);
  }, [canvas]);

  const paste = useCallback(async () => {
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
  }, [canvas, clipboard, saveHistory]);

  const moveUp = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;
      canvas.bringObjectForward(activeObject);
      canvas.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const moveDown = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;

      const objects = canvas.getObjects();
      const index = objects.indexOf(activeObject);
      const hasBackground = objects[0]?.get('id') === 'background-layer';

      // 조작 대상이 배경이 아니고, 배경 레이어가 0번에 있다면 인덱스 1까지만 허용
      if (
        activeObject.get('id') !== 'background-layer' &&
        hasBackground &&
        index <= 1
      ) {
        return;
      }

      canvas.sendObjectBackwards(activeObject);
      canvas.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const moveTop = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;
      canvas.bringObjectToFront(activeObject);
      canvas.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const moveBottom = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;

      const objects = canvas.getObjects();
      const hasBackground = objects[0]?.get('id') === 'background-layer';

      // 배경 레이어가 있다면 인덱스 1로 이동, 없으면 맨 뒤(0)로 이동
      if (activeObject.get('id') !== 'background-layer' && hasBackground) {
        canvas.moveObjectTo(activeObject, 1);
      } else {
        canvas.sendObjectToBack(activeObject);
      }

      canvas.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const lock = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;
      activeObject.set({
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasControls: false,
        editable: false,
        isLocked: true,
      });
      canvas?.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const unLock = useCallback(
    (activeObject: FabricObject) => {
      if (!activeObject || !canvas) return;
      activeObject.set({
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
        isLocked: false,
        hasControls: true,
        editable: true,
      });
      canvas?.requestRenderAll();
      saveHistory();
    },
    [canvas, saveHistory]
  );

  const syncActiveObjectInfo = useCallback((canvas: Canvas) => {
    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length === 0) {
      setActiveInfo({ type: null, isLocked: false, filters: [], styles: {} });
      return;
    }

    const primaryObject = activeObjects[0];

    // UI 버튼 활성화를 위해 필요한 정보만 추출
    setActiveInfo({
      type: primaryObject.type,
      isLocked: (primaryObject as any).isLocked || false,
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
  }, []);

  // 캔버스 초기화 시 이벤트 리스너 등록
  const setupEventListeners = useCallback(
    (canvas: Canvas) => {
      // 1. 객체 선택 상태 동기화 (UI 업데이트용)
      const selectionEvents = [
        'selection:created',
        'selection:updated',
        'selection:cleared',
        'text:selection:changed',
      ];

      const handleSelection = () => syncActiveObjectInfo(canvas);

      selectionEvents.forEach(event => {
        canvas.off(event as any, handleSelection);
        canvas.on(event as any, handleSelection);
      });

      // 2. 조작 내역 저장 (Undo/Redo용)
      const historyEvents = [
        'object:modified',
        'object:added',
        'object:removed',
      ];

      const handleHistory = () => saveHistory();

      historyEvents.forEach(event => {
        canvas.off(event as any, handleHistory);
        canvas.on(event as any, handleHistory);
      });
    },
    [syncActiveObjectInfo, saveHistory]
  );

  const undo = useCallback(async () => {
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
    syncActiveObjectInfo(canvas);
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, [canvas, syncActiveObjectInfo]);

  const redo = useCallback(async () => {
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
    syncActiveObjectInfo(canvas);
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(redoStack.current.length > 0);
  }, [canvas, syncActiveObjectInfo]);

  const exportIntersectedJSON = useCallback(() => {
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

    const propertiesToInclude = [
      'filters',
      'id',
      'name',
      'isLocked',
      'lockMovementX',
      'lockMovementY',
      'lockScalingX',
      'lockScalingY',
      'lockRotation',
      'hasControls',
      'editable',
      'selectable',
      'evented',
    ];
    const json = canvas.toObject(propertiesToInclude);
    json.objects = filteredData.map(obj => obj.toObject(propertiesToInclude));
    return json;
  }, [canvas]);

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
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    lock,
    unLock,
    saveHistory,
    exportIntersectedJSON,
    clipboard,
    canUndo,
    canRedo,
  };
};
