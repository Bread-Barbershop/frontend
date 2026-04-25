import { Canvas } from 'fabric';
import { useEffect, RefObject } from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useKeyboardEvents = (
  canvas: Canvas | null,
  isMouseInCanvasRef: RefObject<boolean>
) => {
  const {
    copy,
    paste,
    lock,
    unLock,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    undo,
    redo,
    handleDeleteShape,
    toggleDrawingMode,
  } = useFabricContext();

  const { setActiveTab } = useEditorStore(
    useShallow(state => ({
      setActiveTab: state.setActiveTab,
    }))
  );

  useEffect(() => {
    if (!canvas) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      const hasActiveObj = canvas.getActiveObjects().length > 0;
      if (!isMouseInCanvasRef.current && !hasActiveObj) return;

      const mod = e.ctrlKey || e.metaKey;

      // 복사 ctrl + c
      if (mod && e.code === 'KeyC') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          copy();
        }
      }

      // 붙여넣기 ctrl + v
      if (mod && e.code === 'KeyV') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (!isEditingText) {
          e.preventDefault();
          paste();
        }
      }

      // 잠그기 ctrl + l
      if (mod && !e.shiftKey && e.code === 'KeyL') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          lock(activeObj);
        }
      }

      // 잠금 해제 ctrl + shift + l
      if (mod && e.shiftKey && e.code === 'KeyL') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          unLock(activeObj);
        }
      }

      // 맨 위로 보내기 ctrl + shift + [
      if (mod && e.shiftKey && e.code === 'BracketLeft') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveTop(activeObj);
        }
      }

      // 맨 아래로 보내기 ctrl + shift + ]
      if (mod && e.shiftKey && e.code === 'BracketRight') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveBottom(activeObj);
        }
      }

      // 위로 보내기 ctrl + [
      if (mod && !e.shiftKey && e.code === 'BracketLeft') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveUp(activeObj);
        }
      }

      // 아래로 보내기 ctrl + ]
      if (mod && !e.shiftKey && e.code === 'BracketRight') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;
        if (activeObj && !isEditingText) {
          e.preventDefault();
          moveDown(activeObj);
        }
      }

      // 삭제 delete
      if (e.key === 'Delete') {
        handleDeleteShape(canvas, e);
      }

      // 되돌리기 ctrl + z
      if (mod && !e.shiftKey && e.code === 'KeyZ') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;

        if (!isEditingText) {
          e.preventDefault();
          undo();
        }
      }

      // 다시하기 ctrl + shift + z
      if (mod && e.shiftKey && e.code === 'KeyZ') {
        const activeObj = canvas.getActiveObject();
        const isEditingText =
          activeObj && 'isEditing' in activeObj && activeObj.isEditing;

        if (!isEditingText) {
          e.preventDefault();
          redo();
        }
      }

      if (e.key === 'Escape') {
        canvas.discardActiveObject();
        if (canvas.isDrawingMode) {
          toggleDrawingMode(canvas, { enable: false });
          setActiveTab('background');
        }
        canvas.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [
    canvas,
    isMouseInCanvasRef,
    copy,
    paste,
    handleDeleteShape,
    moveUp,
    moveDown,
    moveTop,
    moveBottom,
    lock,
    unLock,
    undo,
    redo,
    toggleDrawingMode,
    setActiveTab,
  ]);
};
