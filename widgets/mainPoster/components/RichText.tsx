import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Image, Transformer } from 'react-konva';

import { TiptapText } from '../types/canvas';

interface Props {
  shape: TiptapText;
  isSelected: boolean;
  selectedId: string | null;
  isEditing: boolean;
  onSelect: (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent | KeyboardEvent>
  ) => void;
  onChange: (attrs: Partial<TiptapText>) => void;
  onTransform: (id: string, node: Konva.Image) => void;
  onTextDbClick: () => void;
}

function RichText({
  shape,
  isSelected,
  selectedId,
  isEditing,
  onSelect,
  onChange,
  onTransform,
  onTextDbClick,
}: Props) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imgRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!shape || !shape.dataUrl) return;
    const img = new window.Image();

    img.src = shape.dataUrl;
    img.onload = () => {
      setImage(img);
      imgRef.current?.getLayer()?.batchDraw();
    };
  }, [shape, shape.dataUrl]);

  useEffect(() => {
    if (isSelected && transformerRef.current && imgRef.current) {
      transformerRef.current.nodes([imgRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, image]);

  if (!image) return null;
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        ref={imgRef}
        image={image}
        {...shape}
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
        draggable
        onDblClick={onTextDbClick}
        onDblTap={onTextDbClick}
        onTransformEnd={() => {
          if (imgRef.current) {
            onTransform(shape.id, imgRef.current);
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
}
export default RichText;
