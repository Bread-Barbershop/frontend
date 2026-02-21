'use client';

import { Pencil, Square, Circle, Triangle } from 'lucide-react';
import React, { useState } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export function GraphicPanel() {
  const { canvas, toggleDrawingMode, addDiagram } = useFabricContext();

  // const [brushColor, setBrushColor] = useState('#000000');
  // const [brushWidth, setBrushWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleToggleDrawing = () => {
    if (!canvas) return;
    const nextState = !isDrawing;
    setIsDrawing(nextState);
    toggleDrawingMode(canvas, nextState, () => setIsDrawing(false));
  };

  // const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const color = e.target.value;
  //   setBrushColor(color);
  //   if (canvas) {
  //     setBrushProperties(canvas, color, brushWidth);
  //   }
  // };

  // const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const width = parseInt(e.target.value, 10);
  //   setBrushWidth(width);
  //   if (canvas) {
  //     setBrushProperties(canvas, brushColor, width);
  //   }
  // };

  if (!canvas) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 w-full p-2">
      <NavigationBar>도형</NavigationBar>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => addDiagram(canvas, 'rect')} title="사각형">
          <Square size={20} />
          <span className="text-xs mt-1">사각형</span>
        </button>
        <button onClick={() => addDiagram(canvas, 'circle')} title="원">
          <Circle size={20} />
          <span className="text-xs mt-1">원</span>
        </button>
        <button onClick={() => addDiagram(canvas, 'triangle')} title="삼각형">
          <Triangle size={20} />
          <span className="text-xs mt-1">삼각형</span>
        </button>
        <button
          onClick={handleToggleDrawing}
          className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            isDrawing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
          title="그리기"
        >
          <Pencil size={20} />
          <span className="text-xs mt-1">그리기</span>
        </button>
      </div>

      {/* {isDrawing && (
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
      )} */}
    </div>
  );
}
