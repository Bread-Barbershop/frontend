'use client';

import {
  Canvas,
  FabricObject,
  FabricImage,
  Point,
  // Rect,
  // Circle,
  // Triangle,
  TPointerEventInfo,
  Textbox,
  IText,
} from 'fabric';
// import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import LoadingSpinner from '@/shared/assets/icons/loadingSpinner.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { useKeyboardEvents } from '../hooks/useKeyboardEvents';
import { useSetFabricControls } from '../hooks/useSetFabricControls';
import { preloadFonts, stabilizeCanvasAfterLoad } from '../hooks/useTemplate';
import { initAligningGuidelines } from '../libs/aligning-guidelines';
import { findPrimarySlotTargetBySlotId, getSlotId } from '../slot/queries';
import { FabricObjectWithLock } from '../types/fabric';
import { preloadPreviewFonts } from '../utils/fontLoader';
import {
  getImagePanelMode,
  isFilledSlotImage,
  isFrameTarget,
  isPointInsideSlotFrame,
  isReplaceableSlotImage,
  isReplaceableSlotTarget,
  SlotTargetObject,
} from '../utils/imageSlot';

import { ContextMenu } from './context-menu/ContextMenu';
import Toolbar from './Toolbar';

export const MainPosterPreview = () => {
  // const searchParams = useSearchParams();
  // const isAdmin = searchParams.get('type') === 'admin';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseInCanvasRef = useRef(false);
  const isInitialLoadDoneRef = useRef(false);
  const slotInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<string | null>(null);
  const suppressSelectionClearedRef = useRef(false);
  const suppressOutsideClickRef = useRef(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(false);

  const { activeTab, selectedId, selectedBlock, setActiveTab, setIsEdit } =
    useEditorStore(
      useShallow(state => ({
        activeTab: state.activeTab,
        selectedId: state.selectedId,
        selectedBlock: state.selectedBlock,
        setActiveTab: state.setActiveTab,
        setIsEdit: state.setIsEdit,
      }))
    );

  const {
    canvas,
    setCanvas,
    handleDeleteEmptyShape,
    setupEventListeners,
    startCrop,
    isCropping,
    initialData,
    toggleDrawingMode,
    compressImage,
    replaceSlotImageBySlot,
  } = useFabricContext();

  useSetFabricControls();
  useKeyboardEvents(canvas, isMouseInCanvasRef);

  useEffect(() => {
    void preloadPreviewFonts();
  }, []);

  const openSlotFilePicker = (target: SlotTargetObject) => {
    const slotId = getSlotId(target);
    if (!slotId) {
      return;
    }

    suppressSelectionClearedRef.current = true;
    suppressOutsideClickRef.current = true;
    pendingSlotRef.current = slotId;
    slotInputRef.current?.click();
  };

  useEffect(() => {
    if (!canvas) {
      isInitialLoadDoneRef.current = true;
      return;
    }

    if (!initialData) {
      isInitialLoadDoneRef.current = true;
      setIsCanvasLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsCanvasLoading(true);
        const jsonData =
          typeof initialData === 'string'
            ? JSON.parse(initialData)
            : initialData;

        await preloadFonts(jsonData);
        await canvas.loadFromJSON(jsonData);

        canvas.getObjects().forEach(obj => {
          if ((obj as FabricObjectWithLock).isLocked) {
            obj.set({
              lockMovementX: true,
              lockMovementY: true,
              lockScalingX: true,
              lockScalingY: true,
              lockRotation: true,
              hasControls: false,
              editable: false,
            });
          }

          if (
            obj.isType('textbox') ||
            obj.isType('itext') ||
            obj.isType('text')
          ) {
            const textObj = obj as Textbox | IText;
            textObj.set({
              dirty: true,
              objectCaching: false,
            });
            if ('_initDimensions' in textObj) {
              (textObj as any)._initDimensions();
            } else if ('initDimensions' in textObj) {
              (textObj as any).initDimensions();
            }
            textObj.setCoords();
          }
        });

        await stabilizeCanvasAfterLoad(canvas);
        isInitialLoadDoneRef.current = true;
      } catch (error) {
        console.error('Fabric load Error:', error);
        isInitialLoadDoneRef.current = true;
      } finally {
        setIsCanvasLoading(false);
      }
    };

    loadData();
  }, [canvas, initialData]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 375,
      height: 812,
      backgroundColor: '#ffffff',
      fireRightClick: true,
      stopContextMenu: true,
    });

    setCanvas(fabricCanvas);
    initAligningGuidelines(fabricCanvas);

    const handleSelection = () => {
      const activeObj = fabricCanvas.getActiveObject();
      if (!activeObj) {
        if (!fabricCanvas.isDrawingMode) {
          setActiveTab('background');
        }
        return;
      }

      // 탭 전환 등의 기존 로직 수행
      const isActiveText =
        activeObj instanceof Textbox || activeObj instanceof IText;
      const imagePanelMode = getImagePanelMode(activeObj);
      // const isActiveShape =
      //   activeObj instanceof Rect ||
      //   activeObj instanceof Circle ||
      //   activeObj instanceof Triangle ||
      //   activeObj.isType('line');
      const isCropZone =
        (activeObj as FabricObject & { name?: string })?.name === 'crop-zone';

      if (isActiveText) {
        setActiveTab('text');
      } else if (
        imagePanelMode === 'user-image' ||
        imagePanelMode === 'background-image' ||
        imagePanelMode === 'frame-image' ||
        isCropZone
      ) {
        setActiveTab('image');
      } else if (imagePanelMode === 'empty-frame') {
        setActiveTab('image');
      }
      // else if (isActiveShape && isAdmin) {
      //   setActiveTab('shape');
      // }
      else {
        setActiveTab('background');
      }
    };

    const handleSelectionCleared = () => {
      if (suppressSelectionClearedRef.current) {
        suppressSelectionClearedRef.current = false;
        suppressOutsideClickRef.current = false;
        return;
      }

      if (!fabricCanvas.isDrawingMode) {
        setActiveTab('background');
      }
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      fabricCanvas.off('selection:created', handleSelection);
      fabricCanvas.off('selection:updated', handleSelection);
      fabricCanvas.off('selection:cleared', handleSelectionCleared);
      fabricCanvas.dispose();
    };
    // }, [isAdmin, setCanvas, setActiveTab]);
  }, [setCanvas, setActiveTab]);

  useEffect(() => {
    if (!canvas) return;

    if (activeTab !== 'graphic') {
      if (canvas.isDrawingMode) {
        toggleDrawingMode(canvas, { enable: false });
        setActiveTab('background');
      }
    }
  }, [canvas, activeTab, toggleDrawingMode, setActiveTab]);

  useEffect(() => {
    const fabricCanvas = canvas;
    if (!fabricCanvas) return;

    const markDirty = () => {
      if (isInitialLoadDoneRef.current) {
        useEditorStore.getState().setIsDirty(true);
      }
    };

    const events = [
      'object:added',
      'object:modified',
      'object:removed',
    ] as const;
    events.forEach(event => fabricCanvas.on(event, markDirty));

    return () => {
      events.forEach(event => fabricCanvas.off(event, markDirty));
    };
  }, [canvas]);

  useEffect(() => {
    const fabricCanvas = canvas;
    if (!fabricCanvas) return;
    setupEventListeners(fabricCanvas);

    const cleanupEmpty = handleDeleteEmptyShape(fabricCanvas);

    const handleDoubleClick = (options: TPointerEventInfo) => {
      if (
        options.target &&
        options.target instanceof FabricImage &&
        !isReplaceableSlotImage(options.target) &&
        !isCropping
      ) {
        startCrop(fabricCanvas);
      }
    };

    const isSelectableAtPointer = (
      object: FabricObject | undefined,
      pointer: Point
    ) => {
      if (!object) return false;
      if (isReplaceableSlotImage(object)) {
        return isPointInsideSlotFrame(object, pointer);
      }
      return object.containsPoint(pointer);
    };
    // 마우스 드래그해 그룹으로 영역 선택시 잠금 객체 제외하고 선택될수있게
    const handleMouseDown = (options: TPointerEventInfo) => {
      const e = options.e as MouseEvent;
      if (e.button === 2) return; // 우클릭(Right Click)은 무시

      const pointer = options.scenePoint || fabricCanvas.getScenePoint(e);
      let target = options.target;

      if (target && !isSelectableAtPointer(target, pointer)) {
        target = undefined;
      }

      const targetId = target?.get('id');
      const isBackground = targetId === 'background-layer';
      const isLocked = (target as FabricObjectWithLock | undefined)?.isLocked;
      const isFrame = isFrameTarget(target);
      // 잠긴 객체가 잡혔을 때, 그 위치에 있는 다른 (잠기지 않은) 객체를 찾아서 선택해줌
      if (target && (isLocked || isFrame) && !isBackground) {
        const objects = fabricCanvas.getObjects();

        // 역순(맨 위 객체부터)으로 탐색하여 잠기지 않은 객체가 있는지 확인
        for (let i = objects.length - 1; i >= 0; i--) {
          const obj = objects[i];
          if (
            obj !== target &&
            !(obj as FabricObjectWithLock).isLocked &&
            !isFrameTarget(obj) &&
            isSelectableAtPointer(obj, pointer)
          ) {
            fabricCanvas.setActiveObject(obj);
            target = obj;
            break;
          }
        }
      }

      // 빈 공간 클릭(드래그 선택 시작) 또는 배경 클릭 시 잠긴 객체의 selectable 해제
      if (!target || isBackground) {
        fabricCanvas.getObjects().forEach(obj => {
          const t = obj as FabricObjectWithLock;
          if (
            (t.isLocked ||
              t.get('id') === 'background-layer' ||
              isFrameTarget(t)) &&
            t !== target
          ) {
            t.set({ selectable: false });
          }
        });

        if (!target) {
          if (!fabricCanvas.isDrawingMode) {
            setActiveTab('background');
          }
        }
      }
    };

    const handleMouseUp = (options: TPointerEventInfo) => {
      // 드래그 종료 시 (또는 클릭 종료 시) 잠긴 객체와 배경 레이어의 selectable 다시 복구
      fabricCanvas.getObjects().forEach(obj => {
        const target = obj as FabricObjectWithLock;
        if (
          target.isLocked ||
          target.get('id') === 'background-layer' ||
          isFrameTarget(target)
        ) {
          target.set({ selectable: true });
        }
      });

      if (isCropping) return;

      const pointer =
        options.scenePoint || fabricCanvas.getScenePoint(options.e);
      const slotTarget =
        isReplaceableSlotTarget(options.target) &&
        isSelectableAtPointer(options.target, pointer)
          ? options.target
          : null;

      if (slotTarget) {
        fabricCanvas.setActiveObject(slotTarget);
        setActiveTab('image');

        // if (!isAdmin && !isFilledSlotImage(slotTarget)) {
        if (!isFilledSlotImage(slotTarget)) {
          openSlotFilePicker(slotTarget);
        }
      }
    };

    fabricCanvas.on('mouse:dblclick', handleDoubleClick);
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      cleanupEmpty();
      fabricCanvas.off('mouse:dblclick', handleDoubleClick);
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [
    canvas,
    compressImage,
    handleDeleteEmptyShape,
    isCropping,
    replaceSlotImageBySlot,
    setActiveTab,
    setupEventListeners,
    startCrop,
    // isAdmin,
  ]);

  // 마우스가 캔버스에 들어왔는지 나갔는지 확인
  useEffect(() => {
    if (!canvas) return;
    const el = canvas.upperCanvasEl;
    const onEnter = () => (isMouseInCanvasRef.current = true);
    const onLeave = () => (isMouseInCanvasRef.current = false);

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [canvas]);

  // 외부클릭시 액티브 해제
  useEffect(() => {
    if (!canvas) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (suppressOutsideClickRef.current) {
        suppressOutsideClickRef.current = false;
        return;
      }

      if (
        target.classList.contains('upper-canvas') ||
        target.closest('[data-canvas="true"]')
        // || target.closest('[data-crop-controls="true"]')
      ) {
        return;
      }

      canvas.discardActiveObject();
      canvas.renderAll();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [canvas]);

  return (
    <>
      <input
        ref={slotInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async event => {
          const file = event.target.files?.[0];
          if (!event.target.files?.length) {
            pendingSlotRef.current = null;
            suppressSelectionClearedRef.current = false;
            suppressOutsideClickRef.current = false;
            return;
          }

          const pendingSlotId = pendingSlotRef.current;
          event.target.value = '';

          if (!file || !canvas || !pendingSlotId) return;

          const slotTarget = findPrimarySlotTargetBySlotId(canvas, pendingSlotId);
          if (!slotTarget) {
            pendingSlotRef.current = null;
            suppressSelectionClearedRef.current = false;
            suppressOutsideClickRef.current = false;
            return;
          }

          const reader = new FileReader();
          reader.onload = async loadEvent => {
            const base64 = loadEvent.target?.result;
            if (typeof base64 !== 'string') return;

            const compressed = await compressImage(base64);
            suppressSelectionClearedRef.current = true;

            try {
              const replacedImage = await replaceSlotImageBySlot(
                pendingSlotId,
                compressed
              );
              if (replacedImage) {
                setActiveTab('image');
              } else {
                suppressSelectionClearedRef.current = false;
                suppressOutsideClickRef.current = false;
              }
            } finally {
              pendingSlotRef.current = null;
              suppressOutsideClickRef.current = false;
            }
          };
          reader.readAsDataURL(file);
        }}
      />
      <div
        onClick={() => {
          setIsEdit(false);
          selectedBlock('mainPoster');
        }}
        className={cn('relative w-[375px] h-[812px] shrink-0')}
      >
        {selectedId === 'mainPoster' && (
          <div
            data-canvas="true"
            className={cn(
              'absolute inset-0 z-10 w-full h-full ring-1 ring-inset ring-primary pointer-events-none'
            )}
          />
        )}

        {canvas && !isCanvasLoading && <ContextMenu />}
        <div
          className={cn(
            'overflow-hidden',
            isCanvasLoading && 'pointer-events-none cursor-progress'
          )}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        {isCanvasLoading && (
          <div className="absolute inset-0 z-20 flex cursor-progress flex-col items-center justify-center gap-3 bg-white/82 backdrop-blur-[1px]">
            <LoadingSpinner className="h-7 w-7 animate-spin text-text-primary" />
            <p className="text-sm text-text-primary">
              저장된 포스터를 불러오는 중...
            </p>
          </div>
        )}
      </div>
      {selectedId === 'mainPoster' && <Toolbar />}
    </>
  );
};
