'use client';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { toStyle } from '@/shared/utils/toStyle';

export const useBodyFontFamily = () =>
  useEditorStore(state => toStyle(state.bodyData, false).fontFamily);
