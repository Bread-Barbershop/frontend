'use client';

import {
  Canvas,
  FabricObject,
  TPointerEvent,
  TPointerEventInfo,
  FabricImage,
} from 'fabric';
declare module 'fabric' {
  // 생성 시 넘기는 옵션 타입 확장
  interface FabricObjectProps {
    id?: string;
    targetId?: string;
  }
  // 실제 생성된 객체 인스턴스 타입 확장
  interface FabricObject {
    id?: string;
    targetId?: string;
  }
}
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { cn } from '@/shared/utils/cn';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { useSetFabricControls } from '../hooks/useSetFabricControls';

import ContextMenu from './ContextMenu';
import Toolbar from './Toolbar';

export const PosterEditor = () => {
  const [clipboard, setClipboard] = useState<FabricObject | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvas, setCanvas, setActiveObject, setActiveTab, activeObject } =
    useEditorStore(
      useShallow(state => ({
        canvas: state.canvas,
        setCanvas: state.setCanvas,
        setActiveObject: state.setActiveObject,
        setActiveTab: state.setActiveTab,
        activeObject: state.activeObject,
      }))
    );
  const {
    activeDrawingMode,
    dragToCreateTextBox,
    handleDrawingMode,
    handleDeleteShape,
    handleDeleteEmptyShape,
    copy,
    paste,
    startCrop,
    isCropping,
  } = useFabricContext();

  useSetFabricControls();

  const { selectedId, selectedBlock } = useEditorStore(
    useShallow(state => ({
      selectedId: state.selectedId,
      selectedBlock: state.selectedBlock,
    }))
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 350,
      height: 600,
      backgroundColor: '#f9fafb',
      fireRightClick: true,
      stopContextMenu: true,
    });
    setCanvas(fabricCanvas);

    const handleSelection = () => {
      const activeObj = fabricCanvas.getActiveObject();
      setActiveObject(activeObj ?? null);

      const isActiveImage = activeObj instanceof FabricImage;
      const isCropZone =
        (activeObj as FabricObject & { name?: string })?.name === 'crop-zone';

      if (isActiveImage || isCropZone) {
        setActiveTab('image');
      } else {
        setActiveTab(null);
      }
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => {
      setActiveObject(null);
      setActiveTab(null);
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, [setCanvas, setActiveObject, setActiveTab]);

  useEffect(() => {
    if (!canvas) return;
    if (activeDrawingMode) dragToCreateTextBox(canvas);
    const cleanupEmpty = handleDeleteEmptyShape(canvas);
    const onKeyDown = (e: KeyboardEvent) => {
      handleDeleteShape(canvas, e);
    };
    const handleSelection = () => {
      const selected = canvas.getActiveObject() as FabricObject;
      setActiveObject(selected || null);

      if (selected instanceof FabricImage) {
        setActiveTab('image');
      } else {
        setActiveTab(null);
      }
    };

    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      const e = opt.e as MouseEvent;
      if (e.button === 2) return; // 우클릭은 무시
      if (!opt.target) {
        setActiveObject(null);
        setActiveTab(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    canvas.on('mouse:down', options => {
      if (!options.target) {
        setActiveObject(null);
        setActiveTab(null);
      }
    });

    canvas.on('mouse:dblclick', options => {
      if (
        options.target &&
        options.target instanceof FabricImage &&
        !isCropping
      ) {
        startCrop(canvas);
      }
    });

    return () => {
      cleanupEmpty();
      window.removeEventListener('keydown', onKeyDown);
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [
    canvas,
    activeDrawingMode,
    dragToCreateTextBox,
    handleDeleteEmptyShape,
    handleDeleteShape,
    setActiveObject,
    setActiveTab,
  ]);

  const isMouseInCanvasRef = useRef(false);

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
    if (!activeObject || !canvas) return;
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isMouseInCanvasRef.current) return;

      // Ctrl(Windows/Linux) / Cmd(Mac) 둘 다 지원
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.code === 'KeyC' && activeObject) {
        e.preventDefault();
        copy({ activeObject, setClipboard });
      }
      if (mod && e.code === 'KeyV' && clipboard) {
        e.preventDefault();
        paste({ canvas, clipboard });
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeObject, clipboard]);

  return (
    <>
      <div
        onClick={() => selectedBlock('mainPoster')}
        className={cn(
          'relative overflow-visible flex flex-col items-center gap-5 p-10',
          selectedId === 'mainPoster' && 'border border-primary rounded-lg'
        )}
      >
        {canvas && (
          <ContextMenu
            canvas={canvas}
            activeObject={activeObject}
            handleDeleteShape={handleDeleteShape}
            clipboard={clipboard}
            setClipboard={setClipboard}
            copy={copy}
            paste={paste}
          />
        )}
        <div
          style={{
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
      {selectedId === 'mainPoster' && (
        <Toolbar canvas={canvas} handleDrawingMode={handleDrawingMode} />
      )}
    </>
  );
};
