/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { useInitFabricData } from '../hooks/useInitFabricData';
import { useSetFabricControls } from '../hooks/useSetFabricControls';
import { initAligningGuidelines } from '../libs/aligning-guidelines';

import { ContextMenu } from './context-menu/ContextMenu';
import Toolbar from './Toolbar';

export const PosterEditor = () => {
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
    handleDeleteShape,
    handleDeleteEmptyShape,
    setupEventListeners,
    copy,
    paste,
    startCrop,
    isCropping,
  } = useFabricContext();

  useSetFabricControls();
  useInitFabricData();

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 375,
      height: 600,
      fireRightClick: true,
      stopContextMenu: true,
    });

    setCanvas(fabricCanvas);
    initAligningGuidelines(fabricCanvas);

    const handleSelection = () => {
      const activeObj = fabricCanvas.getActiveObject();

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

    const handleMouseDown = (options: TPointerEventInfo<TPointerEvent>) => {
      const e = options.e as MouseEvent;
      if (e.button === 2) return; // 우클릭(Right Click)은 무시
      if (!options.target) {
        setActiveTab(null);
      }
    };

    canvas.on('mouse:dblclick', handleDoubleClick);
    canvas.on('mouse:down', handleMouseDown);

    return () => {
      cleanupEmpty();
      canvas.off('mouse:dblclick', handleDoubleClick);
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [
    canvas,
    handleDeleteEmptyShape,
    handleDeleteShape,
    setActiveTab,
    setupEventListeners,
    startCrop,
    isCropping,
  ]);

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

  useEffect(() => {
    if (!canvas) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest('[data-canvas="true"]')) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      // 캔버스 내부에 마우스가 있거나 현재 선택된 객체가 있을 경우에만 실행
      const hasActiveObj = canvas.getActiveObjects().length > 0;
      if (!isMouseInCanvasRef.current && !hasActiveObj) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.code === 'KeyC') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && (activeObj as any).isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          copy();
        }
      }

      if (mod && e.code === 'KeyV') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && (activeObj as any).isEditing;
        if (!isEditingText) {
          e.preventDefault();
          paste();
        }
      }

      // 딜리트 및 백스페이스 (기존 로직 수행)
      if (e.key === 'Delete') {
        handleDeleteShape(canvas, e);
      }

      if (e.key === 'Escape') {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [canvas, copy, paste, handleDeleteShape]);

  return (
    <>
      <div
        onClick={() => {
          setIsEdit(false);
          selectedBlock('mainPoster');
        }}
        data-canvas-safe="true"
        className={cn(
          'relative',
          selectedId === 'mainPoster' && 'border border-primary rounded-lg'
        )}
      >
        {canvas && <ContextMenu />}
        <div className="rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>
      </div>
      {selectedId === 'mainPoster' && <Toolbar />}
    </>
  );
};
