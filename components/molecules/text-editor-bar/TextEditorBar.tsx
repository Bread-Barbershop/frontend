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
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { TextAlignCenter, TextAlignEnd, TextAlignStart } from 'lucide-react';
import { ReactNode, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';

import { Selector } from '../selector';

import { BoldIcon } from './components/BoldIcon';
// import { BulletPointIcon } from './components/BulletPointIcon';
import { FontColorIcon } from './components/FontColorIcon';
import { ItalicIcon } from './components/ItalicIcon';
import { UnderlineIcon } from './components/UnderlineIcon';

interface TextEditorBarProps {
  initialContent?: string;
  onChange?: (json: JSONContent) => void;
}

interface FontSizeOption {
  label: string;
  value: string;
}

interface TextAlignOption {
  label: ReactNode;
  value: string;
}

const FontSizeOptions: FontSizeOption[] = [
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
];

const TextAlignOptions: TextAlignOption[] = [
  { label: <TextAlignStart size={16} />, value: 'left' },
  { label: <TextAlignCenter size={16} />, value: 'center' },
  { label: <TextAlignEnd size={16} />, value: 'right' },
];

export function TextEditorBar({
  initialContent = '내용을 입력하세요.',
  onChange,
}: TextEditorBarProps) {
  const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>({
    label: '14px',
    value: '14px',
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
        defaultAlignment: 'left',
      }),
    ],
    content: `<p>${initialContent}</p>`,
    editorProps: {
      attributes: {
        class: 'min-h-[120px] outline-none text-[14px] leading-7',
      },
    },
    onUpdate({ editor }) {
      if (!onChange) return;
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full space-y-1">
      {/* 툴바 */}
      <div className="flex justify-between">
        {/* Font Size */}
        <Selector<FontSizeOption>
          options={FontSizeOptions}
          selected={fontSizeSelected}
          onSelect={option => {
            const selected = option as FontSizeOption;
            setFontSizeSelected(selected);
            editor.chain().focus().setFontSize(selected.value).run();
          }}
          placeholder="폰트 크기"
          className="font-bold"
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
      <div className="bg-border-neutral rounded-lg p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
