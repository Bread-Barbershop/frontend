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

import { useFabric } from '../hooks/useFabric';
import { useSetFabricControls } from '../hooks/useSetFabricControls';
import { Image } from '../types/fabric';

import ImageFilterPanel from './ImageFilterPanel';
import Menubar from './Menubar';
import Toolbar from './Toolbar';

const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
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

  // 컨트롤 설정
  useSetFabricControls();

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 450,
      backgroundColor: '#f9fafb',
    });
    setCanvas(fabricCanvas);

    fabricCanvas.on('mouse:move', () => {
      fabricCanvas.requestRenderAll();
    });

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
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cleanupEmpty();
      window.removeEventListener('keydown', onKeyDown);
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '40px',
      }}
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
      <Menubar canvas={canvas} applyRichStyle={applyRichStyle} />
      <div
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <canvas ref={canvasRef} />
      </div>
      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        사용법: 텍스트 <b>더블 클릭</b> 후 글자를 <b>드래그</b>하여 입력하세요.
      </div>
    </div>
  );
};

export default Editor;
