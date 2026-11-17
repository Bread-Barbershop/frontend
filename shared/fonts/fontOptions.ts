import {
  getFontFamilies,
  getFontFallbackStack,
  getFontWeights,
  resolveFontFamily,
} from './fontRegistry';
import { FONT_GROUP_LABELS, getFontGroup } from './providerFonts';

import type { CSSProperties } from 'react';

export type FontFamilyOption = {
  label: string;
  group?: string;
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

const DEFAULT_FONT_FAMILY = 'LINESeedKR';

const getRegularFallbackWeight = (
  weights: string[],
  currentWeight?: string
) => {
  if (currentWeight && weights.includes(currentWeight)) return currentWeight;
  if (weights.includes('400')) return '400';

  return (
    weights
      .filter(weight => !Number.isNaN(Number(weight)))
      .toSorted((a, b) => {
        const aDistance = Math.abs(Number(a) - 400);
        const bDistance = Math.abs(Number(b) - 400);

        if (aDistance !== bDistance) return aDistance - bDistance;

        return Number(a) - Number(b);
      })[0] ??
    weights[0] ??
    '400'
  );
};

export const getFontWeightLabel = (weight: string) => {
  return FONT_WEIGHT_LABELS[weight] ?? weight;
};

export const createFontFamilyOptions = (): FontFamilyOption[] => {
  const groups: Record<keyof typeof FONT_GROUP_LABELS, FontFamilyOption[]> = {
    naver: [],
    baemin: [],
    other: [],
  };

  for (const font of getFontFamilies()) {
    const group = getFontGroup(font.family);
    groups[group].push({
      label: font.label,
      group: FONT_GROUP_LABELS[group],
      value: font.family,
      weights: getFontWeights(font.family),
      defaultWeight: font.defaultWeight,
      style: {
        fontFamily: getFontFallbackStack(font.family),
        fontWeight: font.defaultWeight,
      },
    });
  }

  return [...groups.naver, ...groups.baemin, ...groups.other];
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

export const getDefaultFontFamilyOption = (): FontFamilyOption => {
  const options = createFontFamilyOptions();

  if (options.length === 0) {
    throw new Error(
      'Font registry is empty. At least one font family must be registered.'
    );
  }

  return (
    options.find(option => option.value === DEFAULT_FONT_FAMILY) ?? options[0]
  );
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

  return getRegularFallbackWeight(weights, currentWeight);
};
