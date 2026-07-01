'use client';

import { useMemo } from 'react';

import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { toStyle } from '@/shared/utils/toStyle';

export const useTitleFontInfo = () => {
  const titleData = useEditorStore(state => state.titleData);

  return useMemo(() => {
    const resolvedFontFamily = resolveFontFamily(titleData.font);

    return {
      font: titleData.font,
      resolvedFontFamily,
      mainStyle: toStyle(titleData, true),
      subStyle: toStyle(titleData, true, true),
    };
  }, [titleData]);
};
