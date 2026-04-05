import React from 'react';

import { BulkData } from '../types/block';

export const toStyle = (
  data: BulkData,
  isTitle: boolean,
  isEng?: boolean
): React.CSSProperties => ({
  fontSize: isEng ? '13px' : data.fontSize,
  fontFamily: data.font.startsWith('font-') ? `var(--${data.font})` : undefined,
  fontWeight: data.bold ? '700' : isTitle ? '500' : '400',
  fontStyle: data.italic ? 'italic' : 'normal',
  textDecoration: data.underline ? 'underline' : 'none',
  textAlign: data.align,
  color: data.color,
  letterSpacing: `${data.charSpacing / 100}em`,
  lineHeight: `${data.lineHeight / 100 + 1}`,
});
