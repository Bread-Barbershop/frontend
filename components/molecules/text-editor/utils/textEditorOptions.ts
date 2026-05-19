import type { CSSProperties, ReactNode } from 'react';

export type FontFamilyOption = {
  label: string;
  value: string;
  weights: string[];
  defaultWeight: string;
  style?: CSSProperties;
};

export type FontWeightOption = {
  label: string;
  value: string;
  style?: CSSProperties;
};

export type FontSizeOption = {
  label: string;
  value: string;
};

export type TextAlignValue = 'left' | 'center' | 'right';

export type TextAlignOption = {
  label: ReactNode;
  value: TextAlignValue;
};

const VARIABLE_FONT_WEIGHTS = [
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
];

const FONT_WEIGHT_LABELS: Record<string, string> = {
  '100': 'Thin',
  '200': 'ExtraLight',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'SemiBold',
  '700': 'Bold',
  '800': 'ExtraBold',
  '900': 'Black',
};

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  {
    label: 'Default',
    value: '',
    weights: VARIABLE_FONT_WEIGHTS,
    defaultWeight: '400',
  },
  {
    label: 'LINESeedKR',
    value: 'var(--font-lineseed)',
    weights: ['300', '400', '700'],
    defaultWeight: '400',
    style: { fontFamily: 'var(--font-lineseed)' },
  },
  {
    label: 'Pretendard',
    value: 'var(--font-pretendard)',
    weights: VARIABLE_FONT_WEIGHTS,
    defaultWeight: '400',
    style: { fontFamily: 'var(--font-pretendard)' },
  },
  {
    label: 'Noto Sans',
    value: 'var(--font-noto-kr)',
    weights: ['400', '500', '700'],
    defaultWeight: '400',
    style: { fontFamily: 'var(--font-noto-kr)' },
  },
  {
    label: 'Inter',
    value: 'var(--font-inter)',
    weights: ['400', '500', '700'],
    defaultWeight: '400',
    style: { fontFamily: 'var(--font-inter)' },
  },
  {
    label: 'MaruBuri',
    value: 'var(--font-maruburi)',
    weights: ['200', '300', '400', '600', '700'],
    defaultWeight: '400',
    style: { fontFamily: 'var(--font-maruburi)' },
  },
];

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '30', value: '30px' },
];

export function createFontWeightOptions(
  fontFamily: FontFamilyOption
): FontWeightOption[] {
  const fontFamilyStyle = fontFamily.value || 'var(--font-pretendard)';

  return fontFamily.weights.map(weight => ({
    label: FONT_WEIGHT_LABELS[weight] ?? weight,
    value: weight,
    style: {
      fontFamily: fontFamilyStyle,
      fontWeight: weight,
    },
  }));
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
