'use client';

import * as fabric from 'fabric';
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
import React, { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';

import { useFabric } from '../hooks/useFabric';
import { useSetFabricControls } from '../hooks/useSetFabricControls';

import Toolbar from './Toolbar';

const PosterEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    canvas,
    setCanvas,
    setActiveObject,
    activeObject: _test,
  } = useEditorStore();
  const {
    activeDrawingMode,
    dragToCreateTextBox,
    handleDrawingMode,
    addImage,
    handleDeleteShape,
    handleDeleteEmptyShape,
  } = useFabric();

  useSetFabricControls();

  const { selectedId, selectedBlock } = useEditorStore(
    useShallow(state => ({
      selectedId: state.selectedId,
      selectedBlock: state.selectedBlock,
    }))
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 350,
      height: 600,
      backgroundColor: '#f9fafb',
    });
    setCanvas(fabricCanvas);

    const handleSelection = () => {
      setActiveObject(fabricCanvas.getActiveObject() ?? null);
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => setActiveObject(null));

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;
    if (activeDrawingMode) dragToCreateTextBox(canvas);
    const cleanupEmpty = handleDeleteEmptyShape(canvas);
    const onKeyDown = (e: KeyboardEvent) => {
      handleDeleteShape(canvas, e);
    };
    const handleSelection = () => {
      const selected = canvas.getActiveObject() as fabric.Object;
      setActiveObject(selected || null);
    };

    window.addEventListener('keydown', onKeyDown);
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('mouse:down', options => {
      if (!options.target) {
        setActiveObject(null);
      }
    });

    return () => {
      cleanupEmpty();
      window.removeEventListener('keydown', onKeyDown);
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
    };
  }, [
    canvas,
    activeDrawingMode,
    dragToCreateTextBox,
    handleDeleteEmptyShape,
    handleDeleteShape,
  ]);

  return (
    <div
      onClick={() => selectedBlock('mainPoster')}
      className={
        selectedId === 'mainPoster'
          ? 'relative overflow-visible flex flex-col items-center gap-5 p-10 border border-primary rounded-lg'
          : 'relative overflow-visible flex flex-col items-center gap-5 p-10'
      }
    >
      <Toolbar
        canvas={canvas}
        handleDrawingMode={handleDrawingMode}
        addImage={addImage}
      />
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
  );
};

export default PosterEditor;
