'use client';

import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export function useEditorDirtyTracker(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const markDirty = () => useEditorStore.getState().setIsDirty(true);
    const unsubscribeEditor = useEditorStore.subscribe(
      state => [
        state.block,
        state.images,
        state.shareUrl,
        state.titleData,
        state.bodyData,
        state.backgroundColor,
        state.backgroundTexture,
        state.sectionStyle,
        state.isZoom,
        state.invitationPrivacy,
        state.scrollAnimation,
        state.invitationEffects,
      ],
      markDirty,
      { equalityFn: shallow }
    );
    const unsubscribeBgm = useBgmStore.subscribe((state, prev) => {
      if (
        state.selectedBgmId !== prev.selectedBgmId ||
        state.isLoop !== prev.isLoop ||
        state.volume !== prev.volume ||
        state.userFile !== prev.userFile ||
        state.userFileName !== prev.userFileName ||
        state.userDuration !== prev.userDuration
      ) {
        markDirty();
      }
    });

    return () => {
      unsubscribeEditor();
      unsubscribeBgm();
    };
  }, [enabled]);
}
