'use client';

import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { Text, Transformer } from 'react-konva';

import { TextShape } from '@/types/canvas';

interface TextElementProps {
  shape: TextShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<TextShape>) => void;
}

export const TextElement = ({
  shape,
  isSelected,
  onSelect,
  onChange,
}: TextElementProps) => {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && textRef.current && transformerRef.current) {
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
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            onChange({
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX,
              scaleY,
            });
          }
        }}
      />
      {isSelected && <Transformer ref={transformerRef} />}
    </>
  );
};
