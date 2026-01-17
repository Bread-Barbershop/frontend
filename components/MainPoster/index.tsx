'use client';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Canvas } from './components/Canvas';
import Menubar from './components/Menubar';
import { Toolbar } from './components/Toolbar';
import { useCanvas } from './hooks/useCanvas';
import { TiptapText } from './types/canvas';

const MainPoster = () => {
  const {
    shapes,
    selectedId,
    isEditing,
    cursor,
    addImage,
    updateShape,
    selectShape,
    handleDeleteShape,
    handleTextChange,
    handleTransform,
    handleTextDblClick,
    setIsEditing,
    toggleTextBoxMode,
    newTextBox,
    isAddText,
    drawTextBoxStart,
    drawTextBoxMove,
    drawTextBoxEnd,
  } = useCanvas();

  const shape = shapes.find(s => s.id === selectedId) as TiptapText;
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TextStyleKit,
        // TextStyleKit.configure({
        //   fontSize: {
        //     types: ['heading', 'paragraph'],
        //   },
        // }),
        Highlight,
      ],
      content: shape?.content || '글을 입력해주세요',
      immediatelyRender: false,
      editorProps: {
        attributes: {},
      },
    },
    [selectedId, isEditing]
  );

  return (
    <div className="flex flex-col h-screen">
      <Toolbar onAddText={toggleTextBoxMode} onAddImage={addImage} />
      <Menubar editor={editor} />
      <Canvas
        newTextBox={newTextBox}
        editor={editor}
        shapes={shapes}
        cursor={cursor}
        selectedId={selectedId}
        isEditing={isEditing}
        isAddText={isAddText}
        onSelect={selectShape}
        onUpdateShape={updateShape}
        handleDeleteShape={handleDeleteShape}
        handleTextChange={handleTextChange}
        handleTransform={handleTransform}
        handleTextDblClick={handleTextDblClick}
        setIsEditing={setIsEditing}
        drawTextBoxStart={drawTextBoxStart}
        drawTextBoxMove={drawTextBoxMove}
        drawTextBoxEnd={drawTextBoxEnd}
      />
    </div>
  );
};

export default MainPoster;
