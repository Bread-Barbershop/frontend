'use client';

import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, Transformer } from 'react-konva';

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
  const textRef = useRef<Konva.Text>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // imageSrc가 있으면 이미지 로드
  useEffect(() => {
    if (!shape.imageSrc) {
      return;
    }

    const img = new window.Image();
    let isCancelled = false;
    img.src = shape.imageSrc;

    img.onload = () => {
      if (!isCancelled) {
        setImage(img);
      }
    };

    img.onerror = () => {
      if (!isCancelled) {
        console.error('Failed to load image from imageSrc');
        setImage(null);
      }
    };

    // cleanup: 컴포넌트 언마운트나 imageSrc 변경 시 이미지 로드 취소
    return () => {
      isCancelled = true;
      img.onload = null;
      img.onerror = null;
      img.src = '';
    };
  }, [shape.imageSrc]);

  // imageSrc가 없을 때 image를 null로 설정 (cleanup에서 처리)
  useEffect(() => {
    if (!shape.imageSrc && image !== null) {
      // 다음 렌더 사이클에서 처리
      const timeoutId = setTimeout(() => {
        setImage(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [shape.imageSrc, image]);

  useEffect(() => {
    if (!isSelected || isAddText || !transformerRef.current) return;

    const targetNode = image ? imageRef.current : textRef.current;
    if (targetNode && transformerRef.current) {
      transformerRef.current.nodes([targetNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isAddText, image]);

  // imageSrc가 있고 이미지가 로드되면 Image로 렌더링
  if (shape.imageSrc && image) {
    return (
      <>
        <Image
          alt="image"
          ref={imageRef}
          image={image}
          x={shape.x}
          y={shape.y}
          width={shape.width || image.width}
          height={shape.height || image.height}
          rotation={shape.rotation}
          scaleX={shape.scaleX}
          scaleY={shape.scaleY}
          draggable
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
          onTransformEnd={() => {
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
                width: (shape.width || image.width) * scaleX,
                height: (shape.height || image.height) * scaleY,
              });
            }
          }}
          visible={selectedId !== shape.id || !isEditing}
        />
        {isSelected && !isEditing && (
          <Transformer
            ref={transformerRef}
            enabledAnchors={[
              'top-left',
              'top-center',
              'top-right',
              'middle-right',
              'bottom-right',
              'bottom-center',
              'bottom-left',
              'middle-left',
            ]}
          />
        )}
      </>
    );
  }

  // imageSrc가 없거나 이미지가 로드되지 않으면 Text로 렌더링
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
