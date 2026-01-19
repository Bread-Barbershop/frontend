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
  const { shapes, applyRichStyle, dragToCreateTextBox } = useFabric();

  useEffect(() => {
    if (!canvasRef.current) return;
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 700,
      height: 450,
      backgroundColor: '#f9fafb',
    });
    // 최초 캔버스 등록
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // shapes 데이터 렌더링
  useEffect(() => {
    if (!canvas) return;
    const canvasObjects = canvas.getObjects();
    shapes.forEach(shape => {
      const exists = canvasObjects.find(obj => obj.id === shape.id);
      if (!exists && shape.type === 'text') {
        const text = new fabric.Textbox(shape.text || '', {
          ...shape,
        });
        canvas.add(text);
      }
    });

    canvas.requestRenderAll();
  }, [shapes, canvas]);

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
      <Toolbar canvas={canvas} dragToCreateTextBox={dragToCreateTextBox} />
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
