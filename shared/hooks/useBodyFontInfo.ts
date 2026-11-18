'use client';

import { useMemo } from 'react';

import { BODY_BULK_DATA } from '@/shared/data/sample/bulkData';
import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { usesAutomaticBulkColor } from '@/shared/utils/invitationBackgroundColor';
import { toStyle } from '@/shared/utils/toStyle';

export const useBodyFontInfo = () => {
  const bodyData = useEditorStore(state => state.bodyData);

  return useMemo(() => {
    const style = toStyle(bodyData, false);
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
      isColorAutomatic: usesAutomaticBulkColor(bodyData, BODY_BULK_DATA.color),
      textAlign: style.textAlign || undefined,
    };
  }, [bodyData]);
};
