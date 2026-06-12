import {
  createFontFamilyOptions,
  createFontWeightOptions as buildFontWeightOptions,
  type FontFamilyOption,
  type FontWeightOption,
} from '@/shared/fonts/fontOptions';

import type { ReactNode } from 'react';

export type FontSizeOption = {
  label: string;
  value: string;
};

export type TextAlignValue = 'left' | 'center' | 'right';

export type TextAlignOption = {
  label: ReactNode;
  value: TextAlignValue;
};

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] =
  createFontFamilyOptions();

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '13', value: '13px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '22', value: '22px' },
  { label: '24', value: '24px' },
  { label: '32', value: '32px' },
  { label: '48', value: '48px' },
  { label: '64', value: '64px' },
  { label: '100', value: '100px' },
  { label: '148', value: '148px' },
];

export function createFontWeightOptions(
  fontFamily: FontFamilyOption
): FontWeightOption[] {
  return buildFontWeightOptions(fontFamily);
}

export function findFontWeightOption(
  options: FontWeightOption[],
  weight: string
): FontWeightOption {
  return options.find(option => option.value === weight) ?? options[0];
}

export function getDefaultFontWeightOption(
  fontFamily: FontFamilyOption
): FontWeightOption {
  const options = createFontWeightOptions(fontFamily);

  return findFontWeightOption(options, fontFamily.defaultWeight);
}
