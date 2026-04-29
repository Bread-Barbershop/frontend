'use client';

import { type ReactNode, useRef, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import { BulkData, FontOption, TextAlignOption } from '@/shared/types/block';

import { Selector } from '../selector';

import BulkColorPicker from './components/ColorPicker';
import { useBulkEditor } from './hooks/useBulkEditor';

interface TextEditorPreviewProps {
  children: ReactNode;
  value: BulkData;
  onChange: (bulkData: BulkData) => void;
}

const FONT_SIZE_OPTIONS: FontOption[] = [
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '30px', value: '30px' },
];
const FONT_FAMILY_OPTIONS: FontOption[] = [
  { label: '폰트변경', value: 'default' },
  { label: 'Pretendard', value: 'font-pretendard' },
  { label: 'Noto Sans', value: 'font-noto-kr' },
  { label: 'Inter', value: 'font-inter' },
  { label: '마루부리', value: 'font-maruburi' },
];

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignLeftIcon />, value: 'left' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignRightIcon />, value: 'right' },
];

export function TextEditorPreview({
  children,
  value,
  onChange,
}: TextEditorPreviewProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

  const fontSizeSelected =
    FONT_SIZE_OPTIONS.find(option => option.value === value.fontSize) ??
    FONT_SIZE_OPTIONS[0];
  const fontFamilySelected =
    FONT_FAMILY_OPTIONS.find(option => option.value === value.font) ??
    FONT_FAMILY_OPTIONS[0];
  const textAlignSelected =
    TEXT_ALIGN_OPTIONS.find(option => option.value === value.align) ??
    TEXT_ALIGN_OPTIONS[1];

  const {
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextAlignSelect,
    handleTextColorSelect,
  } = useBulkEditor(value, onChange);
  const handleColorPickerToggle = () => {
    setColorPickerOpen(prev => !prev);
  };

  return (
    <div className="w-full space-y-1">
      <div className="w-full flex flex-col ">
        <div className="w-full flex gap-2 items-center">
          <Selector<FontOption>
            options={FONT_FAMILY_OPTIONS}
            selected={fontFamilySelected}
            onSelect={handleFontFamilySelect}
            placeholder="폰트 변경"
            className="font-semibold w-20"
            addPopWidth={40}
          />
          <Selector<FontOption>
            options={FONT_SIZE_OPTIONS}
            selected={fontSizeSelected}
            onSelect={handleFontSizeSelect}
            placeholder="폰트 크기"
            className="font-semibold"
            addPopWidth={20}
          />
          <div className="relative" ref={colorPickerContainerRef}>
            <TextEditorButton
              icon={<FontColorIcon />}
              label="글자색"
              onClick={handleColorPickerToggle}
            />

            {colorPickerOpen && (
              <BulkColorPicker
                initialHex={value.color}
                onClose={() => setColorPickerOpen(false)}
                containerRef={colorPickerContainerRef}
                onChange={handleTextColorSelect}
              />
            )}
          </div>
          <TextEditorButton
            icon={<BoldIcon />}
            label="굵게"
            onClick={() => {
              onChange({ ...value, bold: !value.bold });
            }}
          />
          <TextEditorButton
            icon={<ItalicIcon />}
            label="기울임"
            onClick={() => {
              onChange({ ...value, italic: !value.italic });
            }}
          />

          <Selector<TextAlignOption>
            options={TEXT_ALIGN_OPTIONS}
            selected={textAlignSelected}
            onSelect={handleTextAlignSelect}
          />
        </div>
      </div>
      <div className="bg-bg-base border border-border-neutral rounded-lg py-4">
        {children}
      </div>
    </div>
  );
}
