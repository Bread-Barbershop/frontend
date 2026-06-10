import React from 'react';

import { getFontFallbackStack, resolveFontFamily } from '@/shared/fonts/fontRegistry';

import { BulkData } from '../types/block';

export const toStyle = (
  data: BulkData,
  isTitle: boolean,
  isEng?: boolean
): React.CSSProperties => ({
  fontSize: isEng ? '13px' : data.fontSize,
  fontFamily: data.font
    ? getFontFallbackStack(resolveFontFamily(data.font))
    : undefined,
  fontWeight: data.fontWeight || (data.bold ? '600' : '400'),
  fontStyle: data.italic ? 'italic' : 'normal',
  textDecoration: data.underline ? 'underline' : 'none',
  textAlign: data.align,
  color: data.color,
});
