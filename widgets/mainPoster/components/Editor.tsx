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

import Menubar from './Menubar';
import Toolbar from './Toolbar';

const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  // 이미지 타입도 추가하기
  const [activeObject, setActiveObject] = useState<fabric.Textbox | null>(null);
  const {
    activeDrawingMode,
    dragToCreateTextBox,
    handleDrawingMode,
    applyRichStyle,
    handleDeleteShape,
    handleDeleteEmptyShape,
  } = useFabric();

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 450,
      backgroundColor: '#f9fafb',
    });
    setCanvas(fabricCanvas);

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
  }, [canvas, activeDrawingMode]);

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
      <Toolbar canvas={canvas} handleDrawingMode={handleDrawingMode} />
      <Menubar
        key={activeObject?.id || 'empty'}
        canvas={canvas}
        applyRichStyle={applyRichStyle}
        activeObject={activeObject}
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
      <div style={{ color: '#6b7280', fontSize: '14px' }}>
        사용법: 텍스트 <b>더블 클릭</b> 후 글자를 <b>드래그</b>하여 입력하세요.
      </div>
    </div>
  );
};

export default Editor;
