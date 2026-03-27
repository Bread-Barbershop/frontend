import React from 'react';

import { BulkData } from '../types/block';

export const toStyle = (
  data: BulkData,
  isTitle: boolean,
  isEng?: boolean
): React.CSSProperties => ({
  fontSize: isEng ? '13px' : data.fontSize,
  // fontFamily: data.fontFamily === 'default' ? undefined : data.fontFamily,
  fontWeight: data.bold ? '700' : isTitle ? '500' : '400',
  fontStyle: data.italic ? 'italic' : 'normal',
  textDecoration: data.underline ? 'underline' : 'none',
  color: data.color,
});
