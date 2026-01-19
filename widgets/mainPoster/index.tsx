'use client';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Canvas } from './components/CanvasRegacy';
import Menubar from './components/MenubarRegacy';
import { Toolbar } from './components/ToolbarRegacy';
import { LetterSpacing } from './extensions/letterSpacing';
import { TextStroke } from './extensions/textStroke';
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
    handleRichTextTransform,
    handleRichTextDblClick,
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
        TextStroke,
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
        Highlight.configure({
          multicolor: true, // 여러 색상을 지원하게 함 (중요!)
        }),
        LetterSpacing,
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
        handleRichTextTransform={handleRichTextTransform}
        handleRichTextDblClick={handleRichTextDblClick}
        setIsEditing={setIsEditing}
        drawTextBoxStart={drawTextBoxStart}
        drawTextBoxMove={drawTextBoxMove}
        drawTextBoxEnd={drawTextBoxEnd}
      />
    </div>
  );
};

export default MainPoster;
