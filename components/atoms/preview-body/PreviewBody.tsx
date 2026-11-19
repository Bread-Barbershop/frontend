'use client';
import React from 'react';

import centerLeftStyles from '@/components/molecules/text-editor/utils/centerLeftText.module.css';
import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { cn } from '@/shared/utils/cn';

export const PreviewBody = ({
  html,
  className,
}: {
  html: string;
  className?: string;
}) => {
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
      className={cn(
        'text-sm select-none px-0.5',
        previewTextClassName,
        centerLeftStyles.centerLeftText,
        className
      )}
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
