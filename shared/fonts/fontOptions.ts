import {
  getDefaultFontWeight,
  getFontFamilies,
  getFontFallbackStack,
  getFontWeights,
  resolveFontFamily,
} from './fontRegistry';

import type { CSSProperties } from 'react';

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

export const getFontWeightLabel = (weight: string) => {
  return FONT_WEIGHT_LABELS[weight] ?? weight;
};

export const createFontFamilyOptions = (): FontFamilyOption[] => {
  return getFontFamilies().map(font => ({
    label: font.label,
    value: font.family,
    weights: getFontWeights(font.family),
    defaultWeight: font.defaultWeight,
    style: {
      fontFamily: getFontFallbackStack(font.family),
    },
  }));
};

export const createFontWeightOptions = (
  fontFamily: Pick<FontFamilyOption, 'value' | 'weights'>
): FontWeightOption[] => {
  const resolvedFamily = resolveFontFamily(fontFamily.value);

  return fontFamily.weights.map(weight => ({
    label: getFontWeightLabel(weight),
    value: weight,
    style: {
      fontFamily: getFontFallbackStack(resolvedFamily),
      fontWeight: weight,
    },
  }));
};

export const getDefaultFontFamilyOption = () => {
  return createFontFamilyOptions().find(option => option.value === 'Pretendard');
};

export const getFontFamilyOption = (value?: string | null) => {
  const resolvedFamily = resolveFontFamily(value);
  const options = createFontFamilyOptions();

  return (
    options.find(option => option.value === resolvedFamily) ??
    getDefaultFontFamilyOption() ??
    options[0]
  );
};

export const getFallbackWeight = (family: string, currentWeight?: string) => {
  const weights = getFontWeights(resolveFontFamily(family));

  if (currentWeight && weights.includes(currentWeight)) return currentWeight;

  const defaultWeight = getDefaultFontWeight(resolveFontFamily(family));
  if (weights.includes(defaultWeight)) return defaultWeight;
  if (weights.includes('400')) return '400';

  return weights[0] ?? '400';
};
