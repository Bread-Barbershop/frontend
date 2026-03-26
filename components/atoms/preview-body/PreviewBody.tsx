'ues client';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';

export const PreviewBody = ({ html }: { html: string }) => {
  const { bodyData } = useEditorStore(
    useShallow(state => ({
      bodyData: state.bodyData,
    }))
  );

  const toStyle = (data: BulkData): React.CSSProperties => ({
    fontSize: data.fontSize,
    // fontFamily: data.fontFamily === 'default' ? undefined : data.fontFamily,
    fontWeight: data.bold ? '700' : '400',
    fontStyle: data.italic ? 'italic' : 'normal',
    textDecoration: data.underline ? 'underline' : 'none',
    textAlign: data.align,
    color: data.color,
  });
  return (
    <div
      className="text-sm w-full"
      dangerouslySetInnerHTML={{ __html: html }}
      style={!bodyData.isDefault ? toStyle(bodyData) : undefined}
    />
  );
};
