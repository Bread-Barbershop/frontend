'use client';

import { ChevronDown } from 'lucide-react';
import {
  CSSProperties,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import FontColorIcon from '@/shared/assets/icons/color.svg';
import { hasCustomFontFace, loadCustomFont } from '@/shared/fonts/fontLoader';
import {
  FontFamilyOption,
  FontWeightOption,
  getDefaultFontFamilyOption,
} from '@/shared/fonts/fontOptions';
import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { BulkData } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { Selector } from '../selector';
import {
  createFontWeightOptions,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  getDefaultFontWeightOption,
  type FontSizeOption,
} from '../text-editor/utils/textEditorOptions';

import BulkColorPicker from './components/ColorPicker';
import { useBulkEditor } from './hooks/useBulkEditor';

import type { BulkColorPickerId } from './types';

const DEFAULT_FONT_SIZE_OPTION =
  FONT_SIZE_OPTIONS.find(option => option.value === '14px') ??
  FONT_SIZE_OPTIONS[0];

interface TextEditorPreviewProps {
  children: ReactNode;
  value: BulkData;
  onChange: (bulkData: BulkData) => void;
  colorPickerId: BulkColorPickerId;
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
}

const DEFAULT_FONT_FAMILY_OPTION = getDefaultFontFamilyOption();

export function TextEditorPreview({
  children,
  value,
  onChange,
  colorPickerId,
  activeColorPickerId,
  onActiveColorPickerChange,
}: TextEditorPreviewProps) {
  const colorPickerOpen = activeColorPickerId === colorPickerId;
  const [customFontSizeInput, setCustomFontSizeInput] = useState<string | null>(
    null
  );

  const fontSizeSelected: FontSizeOption =
    customFontSizeInput !== null
      ? {
          label: customFontSizeInput,
          value: customFontSizeInput ? `${customFontSizeInput}px` : '',
        }
      : (FONT_SIZE_OPTIONS.find(option => option.value === value.fontSize) ??
        (value.fontSize
          ? {
              label: value.fontSize.replace('px', ''),
              value: value.fontSize,
            }
          : DEFAULT_FONT_SIZE_OPTION));

  const fontFamilySelected =
    FONT_FAMILY_OPTIONS.find(
      option => option.value === resolveFontFamily(value.font)
    ) ?? DEFAULT_FONT_FAMILY_OPTION;

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

  const {
    selectedFontFamily,
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextColorSelect,
    handleFontWeightSelect,
  } = useBulkEditor(value, onChange);

  const handleFontSizeSelectWithCustom = (
    option: FontSizeOption | { label: string; value: string }
  ) => {
    if (!option.value) {
      setCustomFontSizeInput('');
      return;
    }
    setCustomFontSizeInput(null);
    handleFontSizeSelect(option);
  };

  const handleFontSizeInputChange = (input: string) => {
    const numericValue = input.replace(/[^0-9]/g, '');
    setCustomFontSizeInput(numericValue);
    if (numericValue) {
      onChange({ ...value, fontSize: `${numericValue}px` });
    }
  };

  const handleFontSizeInputBlur = () => {
    if (customFontSizeInput === '') {
      setCustomFontSizeInput(null);
      onChange({ ...value, fontSize: DEFAULT_FONT_SIZE_OPTION.value });
    }
  };

  useEffect(() => {
    if (
      !hasCustomFontFace(selectedFontFamily.value, fontWeightSelected.value)
    ) {
      return;
    }

    void loadCustomFont(selectedFontFamily.value, fontWeightSelected.value);
  }, [selectedFontFamily.value, fontWeightSelected.value]);

  const handleColorPickerToggle = () => {
    onActiveColorPickerChange(colorPickerOpen ? null : colorPickerId);
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex flex-col gap-1">
        <div className="w-full">
          <Selector<FontFamilyOption>
            options={FONT_FAMILY_OPTIONS}
            selected={fontFamilySelected}
            onSelect={handleFontFamilySelect}
            placeholder="Font"
            variant="fontFamily"
            showCheckbox={false}
            className="w-full"
          />
        </div>
        <div className="flex h-8 gap-3 items-center justify-between">
          <Selector<FontWeightOption>
            options={fontWeightOptions}
            selected={fontWeightSelected}
            onSelect={handleFontWeightSelect}
            placeholder="Weight"
            variant="fontWeight"
            showCheckbox={false}
            className="w-full"
          />
          <Selector<FontSizeOption>
            options={FONT_SIZE_OPTIONS}
            selected={fontSizeSelected}
            onSelect={handleFontSizeSelectWithCustom}
            onInputChange={handleFontSizeInputChange}
            onInputBlur={handleFontSizeInputBlur}
            placeholder="Size"
            variant="fontSize"
            showCheckbox={false}
            className="w-full"
          />
          <div className="relative">
            <button
              type="button"
              aria-label="Font color"
              aria-pressed={colorPickerOpen}
              onMouseDown={event => event.preventDefault()}
              onClick={handleColorPickerToggle}
              className={cn(
                'flex h-8 w-[50px] items-center justify-between overflow-hidden rounded-lg bg-white py-1 pl-2 text-text-primary shadow-[inset_0_0_0_1px_#eaeaea] transition-colors hover:bg-[#FAFAFB] active:bg-[#F5F8FF]',
                colorPickerOpen && 'bg-[#F5F8FF]'
              )}
            >
              <FontColorIcon
                style={
                  {
                    '--text-editor-color-indicator': value.color,
                  } as CSSProperties
                }
              />
              <div
                className={cn(
                  'flex-center size-6 shrink-0 transition-transform duration-200',
                  colorPickerOpen && 'rotate-180'
                )}
              >
                <ChevronDown size={12} />
              </div>
            </button>

            {colorPickerOpen && (
              <BulkColorPicker
                initialHex={value.color}
                onClose={() => onActiveColorPickerChange(null)}
                onChange={handleTextColorSelect}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-bg-base border border-border-neutral rounded-lg py-4">
        {children}
      </div>
    </div>
  );
}
