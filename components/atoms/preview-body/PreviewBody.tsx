'use client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { toStyle } from '@/shared/utils/toStyle';

export const PreviewBody = ({ html }: { html: string }) => {
  const { bodyData } = useEditorStore(
    useShallow(state => ({
      bodyData: state.bodyData,
    }))
  );

  return (
    <div
      className={`text-sm ${previewTextClassName}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={!bodyData.isDefault ? toStyle(bodyData, false) : undefined}
    />
  );
};
