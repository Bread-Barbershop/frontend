'use client';

import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent } from '@tiptap/react';
import { TextAlignCenter, TextAlignEnd, TextAlignStart } from 'lucide-react';
import { ReactNode, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';

import { Selector } from '../selector';

import { BoldIcon } from './components/BoldIcon';
// import { BulletPointIcon } from './components/BulletPointIcon';
import { FontColorIcon } from './components/FontColorIcon';
import { ItalicIcon } from './components/ItalicIcon';
import { UnderlineIcon } from './components/UnderlineIcon';

interface FontSizeOption {
  label: string;
  value: string;
}

interface TextAlignOption {
  label: ReactNode;
  value: string;
}

const FontSizeOptions: FontSizeOption[] = [
  { label: '14px', value: '14' },
  { label: '16px', value: '16' },
  { label: '18px', value: '18' },
  { label: '20px', value: '20' },
  { label: '24px', value: '24' },
  { label: '30px', value: '30' },
];

const TextAlignOptions: TextAlignOption[] = [
  { label: <TextAlignStart size={16} />, value: 'left' },
  { label: <TextAlignCenter size={16} />, value: 'center' },
  { label: <TextAlignEnd size={16} />, value: 'right' },
];

export function TextEditorBar() {
  const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>({
    label: '20px',
    value: '20',
  });
  const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>({
    label: <TextAlignStart size={16} />,
    value: 'left',
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color,
      ListItem,
      BulletList,
      FontSize,
      TextAlign.configure({
        types: ['paragraph', 'listItem'],
      }),
    ],
    content: '<p>내용을 입력하세요.</p>',
  });

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {/* 툴바 */}
      <div className="flex gap-1 border-b pb-2">
        {/* Font Size */}
        <Selector<FontSizeOption>
          options={FontSizeOptions}
          selected={fontSizeSelected}
          onSelect={option => {
            const selected = option as FontSizeOption;
            setFontSizeSelected(selected);
            editor
              .chain()
              .focus()
              .setMark('textStyle', { fontSize: `${selected.value}px` })
              .run();
          }}
          placeholder="폰트 크기"
        />

        {/* Bold */}
        <TextEditorButton
          icon={<BoldIcon size={28} />}
          label="굵게"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        {/* Italic */}
        <TextEditorButton
          icon={<ItalicIcon size={28} />}
          label="기울임"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        {/* Underline */}
        <TextEditorButton
          icon={<UnderlineIcon size={28} />}
          label="밑줄"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        {/* Color (현재 핑크색 고정) */}
        <TextEditorButton
          icon={<FontColorIcon size={28} />}
          label="글자색"
          active={editor.isActive('textStyle', { color: '#ff4d6d' })}
          onClick={() => editor.chain().focus().setColor('#ff4d6d').run()}
        />

        {/* Bullet */}
        {/* <TextEditorButton
          icon={<BulletPointIcon size={20} />}
          label="글머리 기호"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        /> */}

        <Selector<TextAlignOption>
          options={TextAlignOptions}
          selected={textAlignSelected}
          onSelect={option => {
            const selected = option as TextAlignOption;
            setTextAlignSelected(selected);
            editor
              .chain()
              .focus()
              .setTextAlign(selected.value as 'left' | 'center' | 'right')
              .run();
          }}
        />
      </div>

      {/* 입력 영역 */}
      <div className="border p-3 rounded-md min-h-30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
