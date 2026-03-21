'use client';

import { type ReactNode, useRef, useState } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import BoldIcon from '@/shared/assets/icons/bold.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';

import { Selector } from '../selector';

import ColorPicker from './components/ColorPicker';

interface FontOption {
  label: string;
  value: string;
}

interface TextEditorPreviewProps {
  children: ReactNode;
}

type TextAlignValue = 'left' | 'center' | 'right';

interface TextAlignOption {
  label: ReactNode;
  value: TextAlignValue;
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
  { label: 'Pretendard', value: 'Pretendard' },
  { label: 'Noto Sans', value: 'Noto Sans' },
  { label: 'Inter', value: 'Inter' },
];

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignLeftIcon />, value: 'left' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignRightIcon />, value: 'right' },
];

const DEFAULT_FONT_SIZE_OPTION: FontOption = FONT_SIZE_OPTIONS[0];
const DEFAULT_FONT_FAMILY_OPTION: FontOption = FONT_FAMILY_OPTIONS[0];
const DEFAULT_TEXT_ALIGN_OPTION: TextAlignOption = TEXT_ALIGN_OPTIONS[1];

export function TextEditorPreview({ children }: TextEditorPreviewProps) {
  const [fontSizeSelected, setFontSizeSelected] = useState<FontOption>(
    DEFAULT_FONT_SIZE_OPTION
  );
  const [fontFamilySelected, setFontFamilySelected] = useState<FontOption>(
    DEFAULT_FONT_FAMILY_OPTION
  );
  const [textAlignSelected, setTextAlignSelected] = useState<TextAlignOption>(
    DEFAULT_TEXT_ALIGN_OPTION
  );
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

  const handleFontSizeSelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option as FontOption;
    setFontSizeSelected(selected);
  };
  const handleFontFamilySelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option as FontOption;
    setFontFamilySelected(selected);
  };

  const handleTextAlignSelect = (
    option: TextAlignOption | { label: string; value: string }
  ) => {
    const selected = option as TextAlignOption;
    setTextAlignSelected(selected);
  };

  const handleColorPickerToggle = () => {
    setColorPickerOpen(prev => !prev);
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center">
        <Selector<FontOption>
          options={FONT_FAMILY_OPTIONS}
          selected={fontFamilySelected}
          onSelect={handleFontFamilySelect}
          placeholder="폰트 변경"
          className="font-semibold"
        />
        <Selector<FontOption>
          options={FONT_SIZE_OPTIONS}
          selected={fontSizeSelected}
          onSelect={handleFontSizeSelect}
          placeholder="폰트 크기"
          className="font-semibold"
        />
        <div className="relative" ref={colorPickerContainerRef}>
          <TextEditorButton
            icon={<FontColorIcon />}
            label="글자색"
            onClick={handleColorPickerToggle}
          />

          {colorPickerOpen && (
            <div className="absolute z-50">
              <ColorPicker
                editor={null}
                onClose={() => setColorPickerOpen(false)}
                containerRef={colorPickerContainerRef}
              />
            </div>
          )}
        </div>
        <TextEditorButton icon={<BoldIcon />} label="굵게" onClick={() => {}} />

        <TextEditorButton
          icon={<ItalicIcon />}
          label="기울임"
          onClick={() => {}}
        />

        <TextEditorButton
          icon={<UnderlineIcon />}
          label="밑줄"
          onClick={() => {}}
        />

        <Selector<TextAlignOption>
          options={TEXT_ALIGN_OPTIONS}
          selected={textAlignSelected}
          onSelect={handleTextAlignSelect}
        />
      </div>

      <div className="bg-bg-base border border-border-neutral rounded-lg py-4">
        {children}
      </div>
    </div>
  );
}
