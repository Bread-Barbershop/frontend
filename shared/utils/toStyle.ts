import React from 'react';

import { BulkData } from '../types/block';

export const toStyle = (
  data: BulkData,
  isTitle: boolean,
  isEng?: boolean
): React.CSSProperties => ({
  fontSize: isEng ? '13px' : data.fontSize,
  fontFamily: data.font.startsWith('font-') ? `var(--${data.font})` : undefined,
  fontWeight: data.bold ? '600' : '400',
  fontStyle: data.italic ? 'italic' : 'normal',
  textAlign: data.align,
  color: data.color,
});
