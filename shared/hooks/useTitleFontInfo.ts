'use client';

import { useShallow } from 'zustand/shallow';

import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createBulkOverrideStyle } from '@/shared/utils/createBulkOverrideStyle';

export const useTitleFontInfo = () => {
  return useEditorStore(
    useShallow(state => {
      const resolvedFontFamily = resolveFontFamily(state.titleData.font);

      return {
        font: state.titleData.font,
        resolvedFontFamily,
        koStyle: createBulkOverrideStyle(state.titleData, 'title'),
        enStyle: createBulkOverrideStyle(state.titleData, 'title', true),
      };
    })
  );
};
