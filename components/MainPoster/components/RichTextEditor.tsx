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
  onClose: () => void;
  onUpdateShape: (id: string, attrs: ShapeUpdate) => void;
}

function RichTextEditor({
  editor,
  shape,
  stageRef,
  onClose,
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
    const scale = stage.scaleX();
    const areaPosition = {
      x: stageBox.left + shape.x * scale,
      y: stageBox.top + shape.y * scale,
    };
    setPosition(areaPosition);
  }, [shape, stageRef, onClose]);

  const handleSaveAndClose = async () => {
    if (!editorRef.current || !editor) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const dataUrl = await toPng(
        editorRef.current.querySelector('.ProseMirror') as HTMLElement,
        {
          pixelRatio: 1,
          backgroundColor: 'transparent',
          cacheBust: true,
        }
      );

      onUpdateShape(shape.id, { dataUrl, content: editor.getHTML() });

      onClose();
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
        transformOrigin: 'left-top',
        transform: `rotate(${shape.rotation}deg)`,
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
export default RichTextEditor;
