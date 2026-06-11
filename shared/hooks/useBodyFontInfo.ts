'use client';

import { useMemo } from 'react';

import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createBulkOverrideStyle } from '@/shared/utils/createBulkOverrideStyle';

export const useBodyFontInfo = () => {
  const bodyData = useEditorStore(state => state.bodyData);

  return useMemo(() => {
    const style = createBulkOverrideStyle(bodyData, 'body');
    const resolvedFontFamily = resolveFontFamily(bodyData.font);

    return {
      font: bodyData.font,
      resolvedFontFamily,
      fontFamily: style.fontFamily || undefined,
      fontWeight: style.fontWeight || undefined,
      fontStyle: style.fontStyle || undefined,
      textDecoration: style.textDecoration || undefined,
      fontSize: style.fontSize || undefined,
      color: style.color || undefined,
    };
  }, [bodyData]);
};
