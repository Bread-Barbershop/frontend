'use client';

import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import html2canvas from 'html2canvas';
import { Stage } from 'konva/lib/Stage';
import React, { useEffect, useRef } from 'react';

import { ShapeUpdate, TextShape } from '../types/canvas';

import { EditorToolbar } from './EditorToolbar';

interface Props {
  shape: TextShape;
  stageRef: React.RefObject<Stage | null>;
  onClose: () => void;
  onTextChange: (id: string, newText: string, html?: string) => void;
  onUpdateShape: (id: string, attrs: ShapeUpdate) => void;
}

export const TextArea = ({
  shape,
  stageRef,
  onClose,
  onTextChange,
  onUpdateShape,
}: Props) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: shape.html || shape.text,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[100px] px-2 py-1',
      },
    },
    onUpdate: () => {
      // 실시간 업데이트는 필요 없을 수 있음
    },
  });

  useEffect(() => {
    if (
      !editorContainerRef.current ||
      !editorRef.current ||
      !stageRef.current ||
      !editor
    )
      return;

    const editorContainer = editorContainerRef.current;
    const editorElement = editorRef.current;
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

    // 에디터 컨테이너 스타일 설정
    editorContainer.style.position = 'fixed';
    editorContainer.style.top = `${areaPosition.y}px`;
    editorContainer.style.left = `${areaPosition.x}px`;
    editorContainer.style.width = shape.width
      ? `${shape.width * scale}px`
      : 'auto';
    editorContainer.style.minWidth = '200px';
    editorContainer.style.zIndex = '1000';
    editorContainer.style.border = '1px solid #4A90E2';
    editorContainer.style.background = 'white';
    editorContainer.style.borderRadius = '4px';
    editorContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

    // 에디터 콘텐츠 스타일 설정
    if (editorElement) {
      editorElement.style.fontFamily = shape.fontFamily;
      editorElement.style.fontSize = `${fontSize * scale}px`;
      editorElement.style.letterSpacing = `${letterSpacing}px`;
      editorElement.style.lineHeight = lineHeight.toString();
      editorElement.style.color = shape.fill;
      editorElement.style.minHeight = `${fontSize * scale * 2}px`;
      editorElement.style.maxHeight = '400px';
      editorElement.style.overflowY = 'auto';
    }

    if (shape.rotation) {
      editorContainer.style.transformOrigin = 'left top';
      editorContainer.style.transform = `rotate(${shape.rotation}deg)`;
    }

    // 에디터 포커스
    setTimeout(() => {
      editor.commands.focus();
    }, 0);

    const handleOutsideClick = async (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (editorContainer && !editorContainer.contains(target)) {
        const html = editor.getHTML();
        const text = editor.getText();

        // HTML을 이미지로 변환
        try {
          // ProseMirror 에디터 DOM 요소 찾기
          const proseMirrorElement =
            editorElement.querySelector('.ProseMirror');
          if (proseMirrorElement) {
            const canvas = await html2canvas(
              proseMirrorElement as HTMLElement,
              {
                backgroundColor: null,
                scale: window.devicePixelRatio || 1,
                useCORS: true,
              }
            );
            const imageSrc = canvas.toDataURL('image/png');

            onTextChange(shape.id, text, html);
            onUpdateShape(shape.id, {
              html,
              text,
              imageSrc,
            });
          } else {
            // ProseMirror 요소를 찾지 못한 경우 기본 처리
            onTextChange(shape.id, text, html);
            onUpdateShape(shape.id, {
              html,
              text,
            });
          }
        } catch (error) {
          console.error('HTML to image conversion failed:', error);
          // 변환 실패 시 HTML만 저장
          onTextChange(shape.id, text, html);
          onUpdateShape(shape.id, {
            html,
            text,
          });
        }

        onClose();
      }
    };

    // 더블클릭하자마자 닫히는 걸 방지하기 위해 등록 시점 지연
    const timeoutId = setTimeout(() => {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('touchstart', handleOutsideClick);
    }, 100);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
      clearTimeout(timeoutId);
    };
  }, [shape, stageRef, editor, onTextChange, onClose, onUpdateShape]);

  if (!editor) {
    return null;
  }

  return (
    <div ref={editorContainerRef} className="flex flex-col">
      <EditorToolbar editor={editor} />
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
