'use client';

import { useMemo, type ReactNode } from 'react';

import TextEditorButton from '@/components/atoms/text-editor-button/TextEditorButton';
import AlignCenterIcon from '@/shared/assets/icons/alignCenter.svg';
import AlignLeftIcon from '@/shared/assets/icons/alignLeft.svg';
import AlignRightIcon from '@/shared/assets/icons/alignRight.svg';
import FontColorIcon from '@/shared/assets/icons/color.svg';
import ItalicIcon from '@/shared/assets/icons/italic.svg';
import UnderlineIcon from '@/shared/assets/icons/underline.svg';
import { BulkData } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { Selector } from '../selector';
import {
  createFontWeightOptions,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  getDefaultFontWeightOption,
  type FontFamilyOption,
  type FontSizeOption,
  type FontWeightOption,
  type TextAlignOption,
} from '../text-editor/utils/textEditorOptions';

import BulkColorPicker from './components/ColorPicker';
import { useBulkEditor } from './hooks/useBulkEditor';

import type { BulkColorPickerId } from './types';

interface TextEditorPreviewProps {
  children: ReactNode;
  value: BulkData;
  onChange: (bulkData: BulkData) => void;
  colorPickerId: BulkColorPickerId;
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
}

const TEXT_ALIGN_OPTIONS: TextAlignOption[] = [
  { label: <AlignRightIcon />, value: 'right' },
  { label: <AlignCenterIcon />, value: 'center' },
  { label: <AlignLeftIcon />, value: 'left' },
];

const DEFAULT_FONT_FAMILY_OPTION = FONT_FAMILY_OPTIONS[0];

const DEFAULT_FONT_SIZE_OPTION = FONT_SIZE_OPTIONS[0];
const DEFAULT_TEXT_ALIGN_OPTION = TEXT_ALIGN_OPTIONS[1];

export function TextEditorPreview({
  children,
  value,
  onChange,
  colorPickerId,
  activeColorPickerId,
  onActiveColorPickerChange,
}: TextEditorPreviewProps) {
  const colorPickerOpen = activeColorPickerId === colorPickerId;

  const fontSizeSelected =
    FONT_SIZE_OPTIONS.find(option => option.value === value.fontSize) ??
    DEFAULT_FONT_SIZE_OPTION;

  const fontFamilySelected =
    FONT_FAMILY_OPTIONS.find(option => option.value === value.font) ??
    DEFAULT_FONT_FAMILY_OPTION;

  const textAlignSelected =
    TEXT_ALIGN_OPTIONS.find(option => option.value === value.align) ??
    DEFAULT_TEXT_ALIGN_OPTION;

  const fontWeightOptions = useMemo(
    () => createFontWeightOptions(fontFamilySelected),
    [fontFamilySelected]
  );

  const fontWeightSelected = useMemo(
    () =>
      fontWeightOptions.find(option => option.value === value.fontWeight) ??
      getDefaultFontWeightOption(fontFamilySelected),
    [fontWeightOptions, fontFamilySelected, value.fontWeight]
  );

  const inlineButtonClassName =
    'bg-white hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-[#F5F8FF] aria-pressed:text-[#1F72EF]';

  const {
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextAlignSelect,
    handleTextColorSelect,
    handleFontWeightSelect,
  } = useBulkEditor(value, onChange);
  const handleColorPickerToggle = () => {
    onActiveColorPickerChange(colorPickerOpen ? null : colorPickerId);
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex flex-col gap-1">
        <div className="flex h-8 items-center justify-between">
          <Selector<FontFamilyOption>
            options={FONT_FAMILY_OPTIONS}
            selected={fontFamilySelected}
            onSelect={handleFontFamilySelect}
            placeholder="Font"
            className="w-[210px] font-semibold"
            triggerClassName="h-8 bg-white border border-[#eaeaea]"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
            showCheckbox={false}
          />

          <Selector<FontWeightOption>
            options={fontWeightOptions}
            selected={fontWeightSelected}
            onSelect={handleFontWeightSelect}
            placeholder="Weight"
            className="w-[112px] font-semibold"
            triggerClassName="h-8 bg-white border border-[#eaeaea]"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
            showCheckbox={false}
          />
        </div>

        <div className="flex h-8 items-center justify-between">
          <Selector<FontSizeOption>
            options={FONT_SIZE_OPTIONS}
            selected={fontSizeSelected}
            onSelect={handleFontSizeSelect}
            placeholder="Size"
            className="w-[78px] font-semibold"
            triggerClassName="h-8 bg-[#f3f3f3]"
            openTriggerClassName="bg-white"
            triggerButtonClassName="pl-3 pr-1"
            labelClassName="justify-start text-left text-sm"
            optionLabelClassName="justify-start text-left text-sm"
            showCheckbox={false}
          />

          <div className="relative">
            <TextEditorButton
              icon={<FontColorIcon />}
              label="글자색"
              onClick={handleColorPickerToggle}
            />

            {colorPickerOpen && (
              <BulkColorPicker
                initialHex={value.color}
                onClose={() => onActiveColorPickerChange(null)}
                onChange={handleTextColorSelect}
              />
            )}
          </div>

          <TextEditorButton
            icon={<ItalicIcon />}
            label="Italic"
            active={value.italic}
            className={inlineButtonClassName}
            onClick={() => {
              onChange({ ...value, italic: !value.italic });
            }}
          />

          <TextEditorButton
            icon={<UnderlineIcon />}
            label="Underline"
            active={value.underline}
            className={inlineButtonClassName}
            onClick={() => {
              onChange({ ...value, underline: !value.underline });
            }}
          />

          <div className="flex h-8 items-center gap-1 rounded-md bg-[#f3f3f3] p-px">
            {TEXT_ALIGN_OPTIONS.map(option => {
              const active = textAlignSelected.value === option.value;

              return (
                <TextEditorButton
                  key={option.value}
                  icon={option.label}
                  label={`Align ${option.value}`}
                  active={active}
                  className={cn(
                    'h-[30px] w-[30px] rounded-[5px] hover:bg-[#FAFAFB] active:bg-[#F5F8FF] aria-pressed:bg-white aria-pressed:shadow-sm',
                    !active && 'bg-white shadow-none'
                  )}
                  onClick={() => handleTextAlignSelect(option)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-bg-base border border-border-neutral rounded-lg py-4">
        {children}
      </div>
    </div>
  );
}
