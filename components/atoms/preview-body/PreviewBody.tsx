'use client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

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
      className="text-sm w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
      style={!bodyData.isDefault ? toStyle(bodyData, false) : undefined}
    />
  );
};
