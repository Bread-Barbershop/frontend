import { useState, useCallback } from 'react';
import { Shape, TextShape, ImageShape } from '@/types/canvas';

export const useCanvas = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addText = useCallback(() => {
    const newText: TextShape = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: '텍스트를 입력하세요',
      x: 100,
      y: 100,
      fontSize: 24,
      fill: '#000000',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setShapes((prev) => [...prev, newText]);
    setSelectedId(newText.id);
  }, []);

  const addImage = useCallback((src: string, width: number, height: number) => {
    const newImage: ImageShape = {
      id: `image-${Date.now()}`,
      type: 'image',
      src,
      x: 150,
      y: 150,
      width,
      height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setShapes((prev) => [...prev, newImage]);
    setSelectedId(newImage.id);
  }, []);

  const updateShape = useCallback((id: string, attrs: Partial<Shape>) => {
    setShapes((prev) =>
      prev.map((shape) => (shape.id === id ? { ...shape, ...attrs } : shape))
    );
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));
    setSelectedId(null);
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  return {
    shapes,
    selectedId,
    addText,
    addImage,
    updateShape,
    deleteShape,
    selectShape,
  };
};

