'use client';

import * as fabric from 'fabric';
declare module 'fabric' {
  // 생성 시 넘기는 옵션 타입 확장
  interface FabricObjectProps {
    id?: string;
  }
  // 실제 생성된 객체 인스턴스 타입 확장
  interface FabricObject {
    id?: string;
  }
}
import React, { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/widgets/editor/store/useEditorStore';

import { useFabric } from '../hooks/useFabric';
import { useSetFabricControls } from '../hooks/useSetFabricControls';
import { Image } from '../types/fabric';

import ImageFilterPanel from './ImageFilterPanel';
import Menubar from './Menubar';
import Toolbar from './Toolbar';

const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  // 이미지 타입도 추가하기
  const [activeObject, setActiveObject] = useState<fabric.Textbox | null>(null);
  const [selectedObject, setSelectedObject] =
    useState<fabric.FabricObject | null>(null);
  const {
    shapes,
    activeDrawingMode,
    dragToCreateTextBox,
    handleDrawingMode,
    applyRichStyle,
    addImage,
    applyImageFilter,
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
      setSelectedObject(fabricCanvas.getActiveObject() ?? null);
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

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
      // 이미지일때도 처리해주기
      const selected = canvas.getActiveObject() as fabric.Textbox;
      setActiveObject(selected || null);
    };

    window.addEventListener('keydown', onKeyDown);
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('mouse:down', options => {
      // 클릭한 지점에 객체가 없으면 선택 해제로 간주
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

  const isSelectedImage = selectedObject instanceof fabric.FabricImage;
  const currentImageShape = isSelectedImage
    ? (shapes.find(s => s.id === selectedObject.id) as Image)
    : null;

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

      {isSelectedImage && (
        <ImageFilterPanel
          canvas={canvas}
          applyImageFilter={applyImageFilter}
          currentFilters={currentImageShape?.filters}
        />
      )}
      <div>
        <Menubar
          key={activeObject?.id || 'empty'}
          canvas={canvas}
          applyRichStyle={applyRichStyle}
          activeObject={activeObject}
        />
      </div>
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

export default Editor;
