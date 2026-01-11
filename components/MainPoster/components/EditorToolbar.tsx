'use client';

import { Editor } from '@tiptap/react';
import React from 'react';

import { cn } from '@/utils/cn';

interface EditorToolbarProps {
  editor: Editor;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null;
  }

  const toolbarButtonClass = (isActive: boolean) =>
    cn(
      'px-2 py-1 text-sm font-medium rounded transition-colors',
      isActive
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={toolbarButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={toolbarButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={toolbarButtonClass(editor.isActive('underline'))}
        title="Underline"
      >
        <u>U</u>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={toolbarButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={!editor.can().chain().focus().toggleHighlight().run()}
        className={toolbarButtonClass(editor.isActive('highlight'))}
        title="Highlight"
      >
        <span className="text-xs">H</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        disabled={!editor.can().chain().focus().setTextAlign('left').run()}
        className={toolbarButtonClass(editor.isActive({ textAlign: 'left' }))}
        title="Align Left"
      >
        <span className="text-xs">⬅</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        disabled={!editor.can().chain().focus().setTextAlign('center').run()}
        className={toolbarButtonClass(editor.isActive({ textAlign: 'center' }))}
        title="Align Center"
      >
        <span className="text-xs">⬌</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        disabled={!editor.can().chain().focus().setTextAlign('right').run()}
        className={toolbarButtonClass(editor.isActive({ textAlign: 'right' }))}
        title="Align Right"
      >
        <span className="text-xs">➡</span>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={toolbarButtonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        H1
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        disabled={
          !editor.can().chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={toolbarButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        H2
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        className={toolbarButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <span className="text-xs">•</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        className={toolbarButtonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <span className="text-xs">1.</span>
      </button>
    </div>
  );
};
