'use client';

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import { TextAlignCenter, TextAlignEnd, TextAlignStart } from 'lucide-react';
import { ReactNode, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';

import { Selector } from '../selector';

import { BoldIcon } from './components/BoldIcon';
import { BulletPointIcon } from './components/BulletPointIcon';
import ColorPicker from './components/ColorPicker';
import { FontColorIcon } from './components/FontColorIcon';
import { ItalicIcon } from './components/ItalicIcon';
import { UnderlineIcon } from './components/UnderlineIcon';
import { createTextEditorBarExtensions } from './utils/tiptapExtensions';

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
  { label: <TextAlignStart size={16} strokeWidth={2.5} />, value: 'left' },
  { label: <TextAlignCenter size={16} strokeWidth={2.5} />, value: 'center' },
  { label: <TextAlignEnd size={16} strokeWidth={2.5} />, value: 'right' },
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
    label: <TextAlignStart size={16} strokeWidth={2.5} />,
    value: 'left',
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createTextEditorBarExtensions(),
    content: `<p>${initialContent}</p>`,
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] outline-none text-[14px] leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
      },
    },
    onUpdate({ editor }) {
      if (!onChange) return;
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  const handleBulletListToggle = () => {
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
      return;
    }

    let safety = 0;
    while (editor.isActive('bulletList') && safety < 20) {
      const lifted = editor.chain().focus().liftListItem('listItem').run();
      if (!lifted) break;
      safety += 1;
    }

    if (editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
    }
  };

  return (
    <div className="w-full space-y-1">
      {/* 툴바 */}
      <div className="flex justify-between items-center">
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
          className="font-semibold"
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
        <div className="relative">
          <TextEditorButton
            icon={<FontColorIcon size={28} />}
            label="글자색"
            active={editor.isActive('textStyle')}
            onClick={() => setColorPickerOpen(prev => !prev)}
          />

          {colorPickerOpen && (
            <div className="absolute">
              <ColorPicker editor={editor} />
            </div>
          )}
        </div>

        {/* Bullet */}
        <TextEditorButton
          icon={<BulletPointIcon size={20} />}
          label="글머리 기호"
          active={editor.isActive('bulletList')}
          onClick={handleBulletListToggle}
        />

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
      <div className="bg-border-neutral rounded-lg py-3 px-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
