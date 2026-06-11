'use client';
import React from 'react';

import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';

export const PreviewBody = ({ html }: { html: string }) => {
  const {
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    fontSize,
    color,
    textAlign,
  } = useBodyFontInfo();

  return (
    <div
      className={`text-sm select-none ${previewTextClassName}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        fontSize,
        color,
        textAlign,
      }}
    />
  );
};
