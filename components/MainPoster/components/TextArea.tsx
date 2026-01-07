'use client';

import { Stage } from 'konva/lib/Stage';
import React, { useEffect, useRef } from 'react';

import { ShapeUpdate, TextShape } from '../types/canvas';

interface Props {
  shape: TextShape;
  stageRef: React.RefObject<Stage | null>;
  onClose: () => void;
  onTextChange: (id: string, newText: string) => void;
  onUpdateShape: (id: string, attrs: ShapeUpdate) => void;
}

export const TextArea = ({
  shape,
  stageRef,
  onClose,
  onTextChange,
  onUpdateShape,
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current || !stageRef.current) return;

    const textarea = textareaRef.current;
    const stage = stageRef.current;
    const container = stage.container();
    const stageBox = container.getBoundingClientRect();
    const scale = stage.scaleX();

    const areaPosition = {
      x: stageBox.left + shape.x * scale,
      y: stageBox.top + shape.y * scale,
    };

    const lineHeight = shape.lineHeight || 1.0;
    const fontSize = shape.fontSize || 24;
    const letterSpacing = shape.letterSpacing || 0;

    textarea.value = shape.text;
    textarea.style.fontFamily = shape.fontFamily;
    textarea.style.fontStyle = '300';
    textarea.style.width = shape.width ? `${shape.width * scale}px` : 'auto';
    textarea.style.fontSize = `${fontSize * scale}px`;
    textarea.style.letterSpacing = `${letterSpacing}px`;
    textarea.style.whiteSpace = 'pre-wrap';
    textarea.style.lineHeight = lineHeight.toString();
    textarea.style.wordBreak = 'keep-all';

    textarea.style.position = 'fixed';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;

    textarea.style.color = shape.fill;
    textarea.style.border = '1px solid #4A90E2';
    textarea.style.paddingTop = '0.6px';
    textarea.style.margin = '0px';
    textarea.style.outline = 'none';
    textarea.style.background = 'transparent';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';
    textarea.style.overflow = 'hidden';

    if (shape.rotation) {
      textarea.style.transformOrigin = 'left top';
      textarea.style.transform = `rotate(${shape.rotation}deg)`;
    }

    textarea.focus();

    const handleInput = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    handleInput(); // 초기 높이 설정

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onTextChange(shape.id, textarea.value);

        onClose();
      }
      if (e.key === 'Escape') onClose();
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (e.target !== textarea) {
        onTextChange(shape.id, textarea.value);
        onUpdateShape(shape.id, {
          text: textarea.value,
          height: textarea.scrollHeight,
        });
        onClose();
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);

    // 더블클릭하자마자 닫히는 걸 방지하기 위해 등록 시점 지연
    const timeoutId = setTimeout(() => {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('touchstart', handleOutsideClick);
    }, 0);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
      clearTimeout(timeoutId);
    };
  }, [shape, stageRef, onTextChange, onClose]);

  return <textarea ref={textareaRef} />;
};
