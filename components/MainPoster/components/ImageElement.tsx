'use client';

import { useEffect, useRef, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import Konva from 'konva';
import { ImageShape } from '@/types/canvas';

interface ImageElementProps {
  shape: ImageShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<ImageShape>) => void;
}

export const ImageElement = ({
  shape,
  isSelected,
  onSelect,
  onChange,
}: ImageElementProps) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = shape.src;
    img.onload = () => {
      setImage(img);
    };
  }, [shape.src]);

  useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rotation={shape.rotation}
        scaleX={shape.scaleX}
        scaleY={shape.scaleY}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
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

