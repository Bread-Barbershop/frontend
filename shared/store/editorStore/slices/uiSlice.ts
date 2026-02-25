import { StateCreator } from 'zustand';

import { EditorState, UISlice } from '../types';

export const createUISlice: StateCreator<
  EditorState,
  [],
  [],
  UISlice
> = set => ({
  selectedId: null,
  selectedBlock: id =>
    set({
      selectedId: id,
    }),
  activeTab: null,
  setActiveTab: (tab: 'image' | 'diagram' | null) => set({ activeTab: tab }),
});
