'use client';

import {
  Canvas,
  FabricObject,
  FabricImage,
  Rect,
  Circle,
  Triangle,
  TPointerEventInfo,
  TPointerEvent,
  Textbox,
  IText,
} from 'fabric';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { useKeyboardEvents } from '../hooks/useKeyboardEvents';
import { useSetFabricControls } from '../hooks/useSetFabricControls';
import { initAligningGuidelines } from '../libs/aligning-guidelines';
import { FabricObjectWithLock } from '../types/fabric';

import { ContextMenu } from './context-menu/ContextMenu';
import Toolbar from './Toolbar';

export const MainPosterPreview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseInCanvasRef = useRef(false);

  const { selectedId, selectedBlock, setActiveTab, setIsEdit } = useEditorStore(
    useShallow(state => ({
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
  } = useFabricContext();

  useSetFabricControls();
  useKeyboardEvents(canvas, isMouseInCanvasRef);

  useEffect(() => {
    if (!canvas || !initialData) return;

    const loadData = async () => {
      try {
        const jsonData =
          typeof initialData === 'string'
            ? JSON.parse(initialData)
            : initialData;
        await canvas.loadFromJSON(jsonData);

        canvas.getObjects().forEach(obj => {
          if ((obj as any).isLocked) {
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
        });

        canvas.requestRenderAll();
      } catch (error) {
        console.error('Fabric load Error:', error);
      }
    };

    loadData();
  }, [canvas, initialData]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 365,
      height: 600,
      fireRightClick: true,
      stopContextMenu: true,
    });

    setCanvas(fabricCanvas);
    initAligningGuidelines(fabricCanvas);

    const handleSelection = () => {
      const activeObj = fabricCanvas.getActiveObject();
      if (!activeObj) {
        setActiveTab(null);
        return;
      }

      // 탭 전환 등의 기존 로직 수행
      const isActiveText =
        activeObj instanceof Textbox || activeObj instanceof IText;
      const isActiveImage = activeObj instanceof FabricImage;
      const isActiveDiagram =
        activeObj instanceof Rect ||
        activeObj instanceof Circle ||
        activeObj instanceof Triangle;
      const isCropZone =
        (activeObj as FabricObject & { name?: string })?.name === 'crop-zone';

      if (isActiveText) {
        setActiveTab('text');
      } else if (isActiveImage || isCropZone) {
        setActiveTab('image');
      } else if (isActiveDiagram) {
        setActiveTab('diagram');
      } else {
        setActiveTab(null);
      }
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => {
      setActiveTab(null);
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, [setCanvas, setActiveTab]);

  useEffect(() => {
    if (!canvas) return;
    setupEventListeners(canvas);

    const cleanupEmpty = handleDeleteEmptyShape(canvas);

    const handleDoubleClick = (options: TPointerEventInfo<TPointerEvent>) => {
      if (
        options.target &&
        options.target instanceof FabricImage &&
        !isCropping
      ) {
        startCrop(canvas);
      }
    };

    // 마우스 드래그해 그룹으로 영역 선택시 잠금 객체 제외하고 선택될수있게
    const handleMouseDown = (options: TPointerEventInfo<TPointerEvent>) => {
      const e = options.e as MouseEvent;
      if (e.button === 2) return; // 우클릭(Right Click)은 무시

      // 배경 클릭(드래그 선택 시작) 시 잠긴 객체의 selectable 해제
      if (!options.target) {
        canvas.getObjects().forEach(obj => {
          const target = obj as FabricObjectWithLock;
          if (target.isLocked) {
            target.set({ selectable: false });
          }
        });
        setActiveTab(null);
      }
    };

    const handleMouseUp = () => {
      // 드래그 종료 시 (또는 클릭 종료 시) 잠긴 객체의 selectable 다시 복구
      canvas.getObjects().forEach(obj => {
        const target = obj as FabricObjectWithLock;
        if (target.isLocked) {
          target.set({ selectable: true });
        }
      });
    };

    canvas.on('mouse:dblclick', handleDoubleClick);
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      cleanupEmpty();
      canvas.off('mouse:dblclick', handleDoubleClick);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [
    canvas,
    handleDeleteEmptyShape,
    setActiveTab,
    setupEventListeners,
    startCrop,
    isCropping,
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

      if (
        target.classList.contains('upper-canvas') ||
        target.closest('[data-canvas="true"]')
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
      <div
        onClick={() => {
          setIsEdit(false);
          selectedBlock('mainPoster');
        }}
        className={cn('relative w-[365px] h-[600px] shrink-0')}
      >
        {selectedId === 'mainPoster' && (
          <div
            data-canvas="true"
            className={cn(
              'absolute top-0 left-0 w-full h-full border border-primary rounded-lg pointer-events-none'
            )}
          />
        )}

        {canvas && <ContextMenu />}
        <div className="overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
      {selectedId === 'mainPoster' && <Toolbar />}
    </>
  );
};
