import {
  createFontFamilyOptions,
  createFontWeightOptions as buildFontWeightOptions,
  type FontFamilyOption,
  type FontWeightOption,
  getDefaultFontFamilyOption,
  getFallbackWeight,
  getFontFamilyOption,
} from '@/shared/fonts/fontOptions';

import type { JSONContent } from '@tiptap/core';
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
];

const DEFAULT_FONT_SIZE_OPTION =
  FONT_SIZE_OPTIONS.find(option => option.value === '14px') ??
  FONT_SIZE_OPTIONS[0];

export function createFontWeightOptions(
  fontFamily: FontFamilyOption
): FontWeightOption[] {
  return buildFontWeightOptions(fontFamily);
}

export function findFontWeightOption(
  options: FontWeightOption[],
  weight: string
): FontWeightOption {
  if (options.length === 0) {
    throw new Error(
      'Font weight options are empty. At least one font weight must be registered.'
    );
  }

  return options.find(option => option.value === weight) ?? options[0];
}

export function getDefaultFontWeightOption(
  fontFamily: FontFamilyOption
): FontWeightOption {
  const options = createFontWeightOptions(fontFamily);

  return findFontWeightOption(options, getFallbackWeight(fontFamily.value));
}

export interface InitialEditorStyles {
  fontFamily: FontFamilyOption;
  fontWeight: FontWeightOption;
  fontSize: FontSizeOption;
  textAlign: TextAlignOption;
  color: string;
}

const DEFAULT_TEXT_ALIGN_OPTION: TextAlignOption = {
  label: '가운데',
  value: 'center',
};

export type EditorFallbackStyle = {
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: string;
  color?: string;
};

export function getInitialEditorStyles(
  content: JSONContent | null | undefined,
  defaultAlign: TextAlignValue,
  fallback?: EditorFallbackStyle
): InitialEditorStyles {
  let textAlign: TextAlignOption | undefined;
  let fontFamily: FontFamilyOption | undefined;
  let fontWeight: FontWeightOption | undefined;
  let fontSize: FontSizeOption | undefined;
  let color: string | undefined;

  // content 구조 순회해서 첫 paragraph/text의 attrs 추출
  if (content && Array.isArray(content.content)) {
    for (const node of content.content) {
      // 첫 paragraph의 textAlign 찾기
      if (node.type === 'paragraph' && !textAlign) {
        const paragraphAlign = node.attrs?.textAlign as string | undefined;
        if (paragraphAlign) {
          if (paragraphAlign === 'left') {
            textAlign = { label: '왼쪽', value: 'left' };
          } else if (paragraphAlign === 'center') {
            textAlign = { label: '가운데', value: 'center' };
          } else if (paragraphAlign === 'right') {
            textAlign = { label: '오른쪽', value: 'right' };
          }
        }
      }

      // 첫 text 노드의 textStyle mark 속성 찾기
      if (node.type === 'paragraph' && Array.isArray(node.content)) {
        for (const textNode of node.content) {
          if (textNode.type === 'text' && Array.isArray(textNode.marks)) {
            const textStyleMark = textNode.marks.find(
              mark => mark.type === 'textStyle'
            );
            if (textStyleMark) {
              const attrs = textStyleMark.attrs || {};
              if (!fontFamily && attrs.fontFamily) {
                fontFamily = getFontFamilyOption(attrs.fontFamily);
              }
              if (!fontWeight && attrs.fontWeight) {
                const weightFontFamily =
                  fontFamily ?? getDefaultFontFamilyOption();
                fontWeight = findFontWeightOption(
                  createFontWeightOptions(weightFontFamily),
                  String(attrs.fontWeight)
                );
              }
              if (!fontSize && attrs.fontSize) {
                fontSize = FONT_SIZE_OPTIONS.find(
                  opt => opt.value === attrs.fontSize
                );
              }
              if (!color && attrs.color) {
                color = attrs.color;
              }
            }
          }
        }
      }

      // 찾은 것이 충분하면 순회 중단
      if (textAlign && fontFamily && fontSize && color) break;
    }
  }

  // fontFamily 기본값 결정 (콘텐츠에 없으면 fallback, 그마저 없으면 전역 기본값)
  if (!fontFamily) {
    fontFamily = fallback?.fontFamily
      ? getFontFamilyOption(fallback.fontFamily)
      : getDefaultFontFamilyOption();
  }

  // fontWeight는 fontFamily에 따라 결정
  if (!fontWeight) {
    fontWeight = fallback?.fontWeight
      ? findFontWeightOption(
          createFontWeightOptions(fontFamily),
          fallback.fontWeight
        )
      : getDefaultFontWeightOption(fontFamily);
  }

  // fontSize 기본값
  if (!fontSize) {
    fontSize = fallback?.fontSize
      ? (FONT_SIZE_OPTIONS.find(opt => opt.value === fallback?.fontSize) ?? {
          label: fallback.fontSize.replace('px', ''),
          value: fallback.fontSize,
        })
      : DEFAULT_FONT_SIZE_OPTION;
  }

  // textAlign 기본값
  if (!textAlign) {
    const align = defaultAlign as TextAlignValue;
    if (align === 'left') {
      textAlign = { label: '왼쪽', value: 'left' };
    } else if (align === 'right') {
      textAlign = { label: '오른쪽', value: 'right' };
    } else {
      textAlign = DEFAULT_TEXT_ALIGN_OPTION;
    }
  }

  // color 기본값
  if (!color) {
    color = fallback?.color ?? '#000000';
  }

  return {
    fontFamily,
    fontWeight,
    fontSize,
    textAlign,
    color,
  };
}

export function getDefaultFontSizeOption(): FontSizeOption {
  return DEFAULT_FONT_SIZE_OPTION;
}
