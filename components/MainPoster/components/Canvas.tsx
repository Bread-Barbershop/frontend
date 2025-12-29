'use client';

import { useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { Shape } from '@/types/canvas';
import { TextElement } from './TextElement';
import { ImageElement } from './ImageElement';

interface CanvasProps {
  shapes: Shape[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateShape: (id: string, attrs: Partial<Shape>) => void;
}

export const Canvas = ({
  shapes,
  selectedId,
  onSelect,
  onUpdateShape,
}: CanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 빈 영역 클릭 시 선택 해제
    if (e.target === e.target.getStage()) {
      onSelect(null);
    }
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 73} // 툴바 높이 제외
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedId;
            const handleSelect = () => onSelect(shape.id);
            const handleChange = (attrs: Partial<Shape>) =>
              onUpdateShape(shape.id, attrs);

            if (shape.type === 'text') {
              return (
                <TextElement
                  key={shape.id}
                  shape={shape}
                  isSelected={isSelected}
                  onSelect={handleSelect}
                  onChange={handleChange}
                />
              );
            } else if (shape.type === 'image') {
              return (
                <ImageElement
                  key={shape.id}
                  shape={shape}
                  isSelected={isSelected}
                  onSelect={handleSelect}
                  onChange={handleChange}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

