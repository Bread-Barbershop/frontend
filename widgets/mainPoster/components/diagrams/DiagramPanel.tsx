'use client';

import { Pencil, Square, Circle, Triangle, Minus } from 'lucide-react';
import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export default function DiagramPanel() {
  const { canvas } = useEditorStore(
    useShallow(state => ({
      canvas: state.canvas,
    }))
  );

  const {
    toggleDrawingMode,
    setBrushProperties,
    activeDrawingMode,
    activateShapeMode,
    activeShapeType,
  } = useFabricContext();

  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  const handleToggleDrawing = () => {
    if (!canvas) return;
    toggleDrawingMode(canvas, !activeDrawingMode);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setBrushColor(color);
    if (canvas) {
      setBrushProperties(canvas, color, brushWidth);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value, 10);
    setBrushWidth(width);
    if (canvas) {
      setBrushProperties(canvas, brushColor, width);
    }
  };

  if (!canvas) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 w-full p-2">
      <NavigationBar>도형</NavigationBar>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => activateShapeMode(canvas, 'rect')}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            activeShapeType === 'rect'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
          title="사각형"
        >
          <Square size={20} />
          <span className="text-xs mt-1">사각형</span>
        </button>
        <button
          onClick={() => activateShapeMode(canvas, 'circle')}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            activeShapeType === 'circle'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
          title="원"
        >
          <Circle size={20} />
          <span className="text-xs mt-1">원</span>
        </button>
        <button
          onClick={() => activateShapeMode(canvas, 'triangle')}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            activeShapeType === 'triangle'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
          title="삼각형"
        >
          <Triangle size={20} />
          <span className="text-xs mt-1">삼각형</span>
        </button>
        <button
          onClick={() => activateShapeMode(canvas, 'line')}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            activeShapeType === 'line'
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
          title="선"
        >
          <Minus size={20} />
          <span className="text-xs mt-1">선</span>
        </button>
        <button
          onClick={handleToggleDrawing}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            activeDrawingMode
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100'
          }`}
          title="그리기"
        >
          <Pencil size={20} />
          <span className="text-xs mt-1">그리기</span>
        </button>
      </div>

      {activeDrawingMode && (
        <>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">색상</label>
              <input
                type="color"
                value={brushColor}
                onChange={handleColorChange}
                className="w-6 h-6 rounded-full overflow-hidden cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-600">
                  두께
                </label>
                <span className="text-xs text-gray-500">{brushWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={brushWidth}
                onChange={handleWidthChange}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
