import Konva from 'konva';
import { useState, useCallback } from 'react';

import {
  Shape,
  ShapeUpdate,
  // TextShape,
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

  const handleTextDblClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 얘는 setter 바로 써버리고
  const handleTextChange = useCallback((id: string, newText: string) => {
    console.log({ newText });
    setShapes(prev =>
      prev.map(shape => (shape.id === id ? { ...shape, text: newText } : shape))
    );
  }, []);

  // 얘는 update함수를 통해 setter를 쓰고
  // 내보내기는 셋다 내보내니까,, handle만 내보내던지 updateShape으로 통일할지 정해야함
  const handleTransform = useCallback(
    (id: string, node: Konva.Text) => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;
      const rotation = node.rotation();

      node.setAttrs({
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
      // text: '텍스트를 입력하세요',
      width: Math.abs(newTextBox.width),
      x: newTextBox.width > 0 ? newTextBox.x : newTextBox.x + newTextBox.width,
      y:
        newTextBox.height > 0 ? newTextBox.y : newTextBox.y + newTextBox.height,
      // fontSize: 24,
      // fontFamily: 'Arial',
      // fill: '#000000',
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
    handleTextDblClick,
    handleTextChange,
    handleTransform,
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
