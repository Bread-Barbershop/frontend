'use client';

import Konva from 'konva';
import React, { useEffect, useRef } from 'react';
import { Text, Transformer } from 'react-konva';

import { TextShape } from '../types/canvas';

interface TextElementProps {
  shape: TextShape;
  isSelected: boolean;
  selectedId: string | null;
  isEditing: boolean;
  isAddText: boolean;
  onSelect: (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent | KeyboardEvent>
  ) => void;
  onChange: (attrs: Partial<TextShape>) => void;
  onTextChange: (id: string, newText: string) => void;
  onTransform: (id: string, node: Konva.Text) => void;
  onTextDbClick: () => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TextElement = ({
  shape,
  isSelected,
  selectedId,
  isEditing,
  isAddText,
  onSelect,
  onChange,
  onTransform,
  onTextDbClick,
}: TextElementProps) => {
  const textRef = useRef(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (
      isSelected &&
      isAddText === false &&
      textRef.current &&
      transformerRef.current
    ) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        {...shape}
        draggable
        wrap="word"
        onClick={onSelect}
        onMouseDown={onSelect}
        onTouchStart={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDblClick={onTextDbClick}
        onDblTap={onTextDbClick}
        onTransform={() => {
          if (textRef.current) {
            onTransform(shape.id, textRef.current);
            // console.log(shape.id);
          }
        }}
        visible={selectedId !== shape.id || !isEditing}
      />
      {isSelected && !isEditing && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={[
            'top-center',
            'bottom-center',
            'middle-left',
            'middle-right',
          ]}
        />
      )}
    </>
  );
};
