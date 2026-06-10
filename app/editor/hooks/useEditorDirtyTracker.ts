'use client';

import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export function useEditorDirtyTracker(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = useEditorStore.subscribe(
      state => [
        state.block,
        state.images,
        state.shareUrl,
        state.titleData,
        state.bodyData,
        state.backgroundColor,
        state.isZoom,
      ],
      () => {
        useEditorStore.getState().setIsDirty(true);
      },
      { equalityFn: shallow }
    );

    return unsubscribe;
  }, [enabled]);
}
