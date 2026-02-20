'use client';

import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import { type ReactNode, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';

import { Selector } from '../selector';

import { AlignCenterIcon } from './components/AlignCenterIcon';
import { AlignLeftIcon } from './components/AlignLeftIcon';
import { AlignRightIcon } from './components/AlignRightIcon';
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

type TextAlignValue = 'left' | 'center' | 'right';

interface TextAlignOption {
  label: ReactNode;
  value: TextAlignValue;
}

// 목록 해제 시 무한 반복을 막기 위한 최대 시도 횟수.
const MAX_LIFT_LIST_ITEM_TRIES = 20;
// 폰트 크기 선택 옵션 목록.
const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
];

// 텍스트 정렬 선택 옵션 목록.
const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignLeftIcon size={20} />, value: 'left' },
  { label: <AlignCenterIcon size={20} />, value: 'center' },
  { label: <AlignRightIcon size={20} />, value: 'right' },
];

// 폰트 크기 기본 선택값.
const DEFAULT_FONT_SIZE_OPTION: FontSizeOption = FONT_SIZE_OPTIONS[0];
// 텍스트 정렬 기본 선택값.
const DEFAULT_TEXT_ALIGN_OPTION: TextAlignOption = TEXT_ALIGN_OPTIONS[0];

// 텍스트 에디터 툴바와 편집 영역을 렌더링합니다.
export function TextEditorBar({
  initialContent = '내용을 입력하세요.',
  onChange,
}: TextEditorBarProps) {
  const [fontSizeSelected, setFontSizeSelected] = useState<FontSizeOption>(
    DEFAULT_FONT_SIZE_OPTION
  );
  const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>(
    DEFAULT_TEXT_ALIGN_OPTION
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // TipTap 에디터 인스턴스를 생성하고 변경 시 JSON을 상위로 전달합니다.
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

  // 선택한 폰트 크기를 에디터에 적용합니다.
  const handleFontSizeSelect = (
    option: FontSizeOption | { label: string; value: string }
  ) => {
    const selected = option as FontSizeOption;
    setFontSizeSelected(selected);
    editor.chain().focus().setFontSize(selected.value).run();
  };

  // 선택한 정렬 값을 에디터에 적용합니다.
  const handleTextAlignSelect = (
    option: TextAlignOption | { label: string; value: string }
  ) => {
    const selected = option as TextAlignOption;
    setTextAlignSelected(selected);
    editor.chain().focus().setTextAlign(selected.value).run();
  };

  // 컬러 피커의 열림/닫힘 상태를 토글합니다.
  const handleColorPickerToggle = () => {
    setColorPickerOpen(prev => !prev);
  };

  // 글머리 기호 목록을 켜거나, 중첩된 리스트를 안전하게 해제합니다.
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
      {/* 툴바 */}
      <div className="flex justify-between items-center">
        {/* Font Size */}
        <Selector<FontSizeOption>
          options={FONT_SIZE_OPTIONS}
          selected={fontSizeSelected}
          onSelect={handleFontSizeSelect}
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

        {/* Color */}
        <div className="relative">
          <TextEditorButton
            icon={<FontColorIcon size={28} />}
            label="글자색"
            active={editor.isActive('textStyle')}
            onClick={handleColorPickerToggle}
          />

          {colorPickerOpen && (
            <div className="absolute z-50">
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

        {/* 문단 정렬 */}
        <Selector<TextAlignOption>
          options={TEXT_ALIGN_OPTIONS}
          selected={textAlignSelected}
          onSelect={handleTextAlignSelect}
        />
      </div>

      {/* 입력 영역 */}
      <div className="bg-border-neutral rounded-lg py-3 px-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
