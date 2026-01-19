'use client';

import { Editor, EditorContent } from '@tiptap/react';
import { toPng } from 'html-to-image';
import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';

import { ShapeUpdate, TiptapText } from '../types/canvas';

interface Props {
  editor: Editor | null;
  shape: TiptapText;
  stageRef: React.RefObject<Konva.Stage | null>;
  // onClose: () => void;
  onUpdateShape: (id: string, attrs: ShapeUpdate) => void;
}

function RichTextEditor({
  editor,
  shape,
  stageRef,
  // onClose,
  onUpdateShape,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  // 위치 초기값 바꾸기
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const container = stage.container();
    const stageBox = container.getBoundingClientRect();
    const stageScaleX = stage.scaleX();
    const stageScaleY = stage.scaleY();
    const areaPosition = {
      x: stageBox.left + shape.x * stageScaleX,
      y: stageBox.top + shape.y * stageScaleY,
    };
    setPosition(areaPosition);
  }, [shape.x, shape.y, stageRef]);

  const handleSaveAndClose = async () => {
    if (!editorRef.current || !editor) return;
    const editorElement = editorRef.current.querySelector(
      '.ProseMirror'
    ) as HTMLElement;

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const height = editorElement.scrollHeight;
      const width = editorElement.scrollWidth;
      const dataUrl = await toPng(editorElement, {
        pixelRatio: 5,
        backgroundColor: 'transparent',
        cacheBust: true,
      });

      onUpdateShape(shape.id, {
        dataUrl,
        content: editor.getHTML(),
        height,
        width,
      });

      // onClose();
    } catch (err) {
      console.error('텍스트 내용 이미지 변환 실패 : ', err);
    }
  };

  useEffect(() => {
    if (!editor) return;

    editor.on('blur', handleSaveAndClose); // 외부 클릭 감지 대체

    return () => {
      editor.off('blur', handleSaveAndClose);
    };
  }, [editor, shape.id]);

  return (
    <div
      ref={editorRef}
      className="fixed bg-transparent border rounded-md shadow-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${shape.width}px`,
        transformOrigin: 'left top',
        transform: `rotate(${shape.rotation}deg)`,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
export default RichTextEditor;
