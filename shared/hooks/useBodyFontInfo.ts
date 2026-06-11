'use client';

import { useShallow } from 'zustand/shallow';

import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { createBulkOverrideStyle } from '@/shared/utils/createBulkOverrideStyle';

export const useBodyFontInfo = () => {
  return useEditorStore(
    useShallow(state => {
      const style = createBulkOverrideStyle(state.bodyData, 'body');
      const resolvedFontFamily = resolveFontFamily(state.bodyData.font);

      return {
        font: state.bodyData.font,
        resolvedFontFamily,
        fontFamily: style.fontFamily || undefined,
        fontWeight: style.fontWeight || undefined,
        fontStyle: style.fontStyle || undefined,
        textDecoration: style.textDecoration || undefined,
        fontSize: style.fontSize || undefined,
        color: style.color || undefined,
      };
    })
  );
};
