'use client';

import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import { type ReactNode, useRef, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import BulletPointIcon from '@/shared/assets/icons/order.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';

import { Selector } from '../selector';

import TextEditorColorPickerPopover from './components/TextEditorColorPickerPopover';
import { createTextEditorBarExtensions } from './utils/tiptapExtensions';

interface TextEditorProps {
  value?: JSONContent | null;
  defaultText?: string;
  defaultAlign?: TextAlignValue;
  onChange?: (json: JSONContent) => void;
}

interface FontSizeOption {
  label: string;
  value: string;
}

type TextAlignValue = 'left' | 'center' | 'right';

interface TextAlignOption {
  label: ReactNode;
  value: TextAlignValue;
}

const MAX_LIFT_LIST_ITEM_TRIES = 20;
const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
];

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignLeftIcon />, value: 'left' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignRightIcon />, value: 'right' },
];

const DEFAULT_FONT_SIZE_OPTION: FontSizeOption = FONT_SIZE_OPTIONS[0];
const DEFAULT_TEXT_ALIGN_OPTION: TextAlignOption = TEXT_ALIGN_OPTIONS[1];
const DEFAULT_EDITOR_TEXT = '내용을 입력하세요.';

export function TextEditor({
  value,
  defaultText = DEFAULT_EDITOR_TEXT,
  defaultAlign = DEFAULT_TEXT_ALIGN_OPTION.value,
  onChange,
}: TextEditorProps) {
  const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>(
    DEFAULT_FONT_SIZE_OPTION
  );
  const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>(
    TEXT_ALIGN_OPTIONS.find(opt => opt.value === defaultAlign) ??
      DEFAULT_TEXT_ALIGN_OPTION
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createTextEditorBarExtensions(defaultText),
    content: value ?? null,
    editorProps: {
      attributes: {
        class:
          'flex flex-col items-center justify-center min-h-[120px] outline-none text-[14px] leading-7 selection:bg-primary/20 selection:text-inherit [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
      },
    },
    onCreate({ editor }) {
      onChange?.(editor.getJSON());
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
  });

  if (!editor) return null;

  const handleFontSizeSelect = (
    option: FontSizeOption | { label: string; value: string }
  ) => {
    const selected = option as FontSizeOption;
    setFontSizeSelected(selected);
    editor.chain().focus().setFontSize(selected.value).run();
  };

  const handleTextAlignSelect = (
    option: TextAlignOption | { label: string; value: string }
  ) => {
    const selected = option as TextAlignOption;
    setTextAlignSelected(selected);
    editor.chain().focus().setTextAlign(selected.value).run();
  };

  const handleColorPickerToggle = () => {
    setColorPickerOpen(prev => !prev);
  };

  const handleBulletListToggle = () => {
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run();
      return;
    }

    let safety = 0;
    while (editor.isActive('bulletList') && safety < MAX_LIFT_LIST_ITEM_TRIES) {
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
      <div className="flex justify-between items-center">
        <Selector<FontSizeOption>
          options={FONT_SIZE_OPTIONS}
          selected={fontSizeSelected}
          onSelect={handleFontSizeSelect}
          placeholder="폰트 크기"
          className="font-semibold"
        />

        <TextEditorButton
          icon={<BoldIcon />}
          label="굵게"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        <TextEditorButton
          icon={<ItalicIcon />}
          label="기울임"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <TextEditorButton
          icon={<UnderlineIcon />}
          label="밑줄"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <div className="relative" ref={colorPickerContainerRef}>
          <TextEditorButton
            icon={<FontColorIcon />}
            label="글자색"
            active={editor.isActive('textStyle')}
            onClick={handleColorPickerToggle}
          />

          {colorPickerOpen && (
            <TextEditorColorPickerPopover
              editor={editor}
              onClose={() => setColorPickerOpen(false)}
              containerRef={colorPickerContainerRef}
            />
          )}
        </div>

        <TextEditorButton
          icon={<BulletPointIcon />}
          label="글머리 기호"
          active={editor.isActive('bulletList')}
          onClick={handleBulletListToggle}
        />

        <Selector<TextAlignOption>
          options={TEXT_ALIGN_OPTIONS}
          selected={textAlignSelected}
          onSelect={handleTextAlignSelect}
        />
      </div>

      <div className="bg-border-neutral rounded-lg py-3 px-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
