import Konva from 'konva';
import { useState, useCallback } from 'react';

import {
  Shape,
  ShapeUpdate,
  ImageShape,
  TextBox,
  TiptapText,
} from '../types/canvas';

export const useCanvas = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddText, setIsAddText] = useState(false);
  const [newTextBox, setNewTextBox] = useState<TextBox | null>();
  const [cursor, setCursor] = useState('default');

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
    setShapes(prev => [...prev, newImage]);
    setSelectedId(newImage.id);
  }, []);

  const updateShape = useCallback((id: string, attrs: ShapeUpdate) => {
    setShapes(prev =>
      prev.map(shape =>
        shape.id === id ? ({ ...shape, ...attrs } as Shape) : shape
      )
    );
  }, []);

  const selectShape = useCallback((id: string | null) => {
    setIsEditing(false);
    setSelectedId(id);
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id));
    setSelectedId(null);
  }, []);

  const handleDeleteShape = useCallback(
    (e: KeyboardEvent) => {
      if (
        !isEditing &&
        selectedId &&
        (e.key === 'Delete' || e.key === 'Backspace')
      ) {
        e.preventDefault();
        deleteShape(selectedId);
      } else if (!selectedId && e.key === 'Backspace') {
        const checkGoToBack = confirm(
          '정말 뒤돌아가시겠습니까? 저장되지 않은 내역은 모두 사라집니다'
        );
        if (!checkGoToBack) {
          e.preventDefault();
        }
      }
    },
    [isEditing, selectedId, shapes]
  );

  const handleRichTextDblClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleRichTextTransform = useCallback(
    (id: string, node: Konva.Image) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;
      const image = node.image();

      node.setAttrs({
        image,
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1,
      });

      updateShape(id, {
        width: newWidth,
        height: newHeight,
        rotation: rotation,
        x: node.x(),
        y: node.y(),
      });
    },
    [updateShape]
  );

  const toggleTextBoxMode = (isStart: boolean) => {
    setIsAddText(isStart);
    if (isStart) setCursor('crosshair');
    else setCursor('default');
  };

  const drawTextBoxStart = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isAddText) return;
    const stage = e.target.getStage();
    if (e.target !== stage) return;

    const position = stage.getPointerPosition();
    if (!position || !position.x || !position.y) return;
    setNewTextBox({ x: position?.x, y: position?.y, width: 0, height: 0 });
  };

  const drawTextBoxMove = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isAddText) return;
    const stage = e.target.getStage();
    if (e.target !== stage) return;

    const position = stage.getPointerPosition();
    if (!position || !position.x || !position.y) return;
    setNewTextBox(
      prev =>
        prev && {
          ...prev,
          width: position.x - prev.x,
          height: position.y - prev.y,
        }
    );
  };

  const drawTextBoxEnd = () => {
    if (!isAddText) return;
    if (!newTextBox) {
      setNewTextBox(null);
      return;
    }

    const newText: TiptapText = {
      id: `richtext-${Date.now()}`,
      type: 'richtext',

      width: Math.abs(newTextBox.width),
      height: Math.abs(newTextBox.height),
      x: newTextBox.width > 0 ? newTextBox.x : newTextBox.x + newTextBox.width,
      y:
        newTextBox.height > 0 ? newTextBox.y : newTextBox.y + newTextBox.height,

      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    setShapes(prev => [...prev, newText]);
    setSelectedId(newText.id);
    setIsEditing(true);
    setNewTextBox(null);
    toggleTextBoxMode(false);
  };

  return {
    shapes,
    cursor,
    addImage,
    updateShape,
    deleteShape,
    selectShape,
    selectedId,
    handleDeleteShape,
    handleRichTextDblClick,
    handleRichTextTransform,
    isEditing,
    setIsEditing,
    isAddText,
    toggleTextBoxMode,
    newTextBox,
    drawTextBoxStart,
    drawTextBoxMove,
    drawTextBoxEnd,
  };
};
