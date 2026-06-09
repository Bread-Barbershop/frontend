import { StateCreator } from 'zustand';

import { EditorState, ShareUrlSlice } from '@/shared/types/block';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';

export const createShareUrlSlice: StateCreator<
  EditorState,
  [],
  [],
  ShareUrlSlice
> = set => ({
  shareUrl: createDefaultShareUrlState(),
  shareUrlTab: 'url',
  setShareUrlTab: tab => set({ shareUrlTab: tab }),
  updateShareUrl: data =>
    set(state => ({
      shareUrl: {
        ...state.shareUrl,
        ...data,
      },
    })),
  setShareUrl: data => set({ shareUrl: data }),
});
