'use client';

import { useMemo } from 'react';

import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createBulkOverrideStyle } from '@/shared/utils/createBulkOverrideStyle';

export const useTitleFontInfo = () => {
  const titleData = useEditorStore(state => state.titleData);

  return useMemo(() => {
    const resolvedFontFamily = resolveFontFamily(titleData.font);

    return {
      font: titleData.font,
      resolvedFontFamily,
      koStyle: createBulkOverrideStyle(titleData, 'title'),
      enStyle: createBulkOverrideStyle(titleData, 'title', true),
    };
  }, [titleData]);
};
