'use client';
import React from 'react';

import centerLeftStyles from '@/components/molecules/text-editor/utils/centerLeftText.module.css';
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
      className={`text-sm select-none px-0.5 ${previewTextClassName} ${centerLeftStyles.centerLeftText}`}
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
