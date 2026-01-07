'use client';

import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useEffect, useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

import { Shape, TextBox, TextShape } from '@/types/canvas';

import { ImageElement } from './ImageElement';
import { TextArea } from './TextArea';
import { TextElement } from './TextElement';

interface CanvasProps {
  shapes: Shape[];
  selectedId: string | null;
  isEditing: boolean;
  cursor: string;
  onSelect: (id: string | null) => void;
  onUpdateShape: (id: string, attrs: Partial<Shape>) => void;
  handleDeleteShape: (e: KeyboardEvent) => void;
  handleTextChange: (id: string, newText: string) => void;
  handleTransform: (id: string, node: Konva.Text) => void;
  handleTextDblClick: () => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  newTextBox: TextBox | null | undefined;
  isAddText: boolean;
  drawTextBoxStart: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  drawTextBoxMove: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  drawTextBoxEnd: () => void;
}

export const Canvas = ({
  shapes,
  selectedId,
  isEditing,
  cursor,
  onSelect,
  onUpdateShape,
  handleDeleteShape,
  handleTextChange,
  handleTransform,
  handleTextDblClick,
  setIsEditing,
  newTextBox,
  isAddText,
  drawTextBoxStart,
  drawTextBoxMove,
  drawTextBoxEnd,
}: CanvasProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const stageWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const stageHeight =
    typeof window !== 'undefined' ? window.innerHeight - 73 : 0;

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (isAddText) return;
    if (e.target === e.target.getStage()) {
      onSelect(null);
    }
    console.log('스테이지 클릭');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleDeleteShape);
    return () => window.removeEventListener('keydown', handleDeleteShape);
  }, [handleDeleteShape]);

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 relative">
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        style={{ cursor }}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={drawTextBoxStart}
        onMouseMove={drawTextBoxMove}
        onMouseUp={drawTextBoxEnd}
        onTouchStart={drawTextBoxStart}
      >
        <Layer>
          {newTextBox && (
            <Rect
              {...newTextBox}
              stroke="#4A90E2"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          {shapes.map(shape => {
            const isSelected = shape.id === selectedId;
            const handleSelect = (
              e: Konva.KonvaEventObject<MouseEvent | TouchEvent | KeyboardEvent>
            ) => {
              e.cancelBubble = true;
              onSelect(shape.id);
            };
            const handleChange = (attrs: Partial<Shape>) =>
              onUpdateShape(shape.id, attrs);

            if (shape.type === 'text' && shape.text.length > 0) {
              return (
                <TextElement
                  key={shape.id}
                  selectedId={selectedId}
                  shape={shape}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  isAddText={isAddText}
                  onSelect={e => handleSelect(e)}
                  onChange={handleChange}
                  onTextChange={handleTextChange}
                  onTransform={handleTransform}
                  onTextDbClick={handleTextDblClick}
                  setIsEditing={setIsEditing}
                />
              );
            } else if (shape.type === 'image') {
              return (
                <ImageElement
                  key={shape.id}
                  shape={shape}
                  isSelected={isSelected}
                  onSelect={e => handleSelect(e)}
                  onChange={handleChange}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
      {isEditing && selectedId && (
        <TextArea
          shape={shapes.find(s => s.id === selectedId) as TextShape}
          stageRef={stageRef}
          onClose={() => setIsEditing(false)}
          onTextChange={handleTextChange}
          onUpdateShape={onUpdateShape}
        />
      )}
    </div>
  );
};
