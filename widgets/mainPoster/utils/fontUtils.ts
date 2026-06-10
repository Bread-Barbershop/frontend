import { CSSProperties } from 'react';

import { getFontFallbackStack } from '@/shared/fonts/fontRegistry';

export const MIXED_VALUE = 'Mixed';

export type FontOption = {
  label: string;
  value: string;
  style?: CSSProperties;
};

export const mixedOption: FontOption = {
  label: 'Mixed',
  value: MIXED_VALUE,
};

export const normalizeFontWeight = (weight: unknown) => {
  const value = String(weight ?? '400');

  if (value === 'normal' || value === 'lighter') return '400';
  if (value === 'bold' || value === 'bolder') return '700';

  return value;
};

export const weightToLabel = (weight: string): string => {
  if (weight === MIXED_VALUE) return 'Mixed';

  const normalizedWeight = normalizeFontWeight(weight);

  const weights: Record<string, string> = {
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

  return weights[normalizedWeight as keyof typeof weights] ?? normalizedWeight;
};

export const createFontStyle = (
  family: string,
  fontWeight: string | number = 400
): CSSProperties => {
  if (family === MIXED_VALUE) {
    return {
      fontFamily: 'Pretendard, sans-serif',
      fontWeight: 400,
    };
  }

  return {
    fontFamily: getFontFallbackStack(family),
    fontWeight,
  };
};

export const createFontOption = (
  family: string,
  fontWeight: string | number = 400
): FontOption => {
  return {
    label: family,
    value: family,
    style: createFontStyle(family, fontWeight),
  };
};
