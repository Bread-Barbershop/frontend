import { StateCreator } from 'zustand';

import { EditorState, UISlice } from '@/shared/types/block';

export const createUISlice: StateCreator<
  EditorState,
  [],
  [],
  UISlice
> = set => ({
  isEdit: false,
  setIsEdit: (isEdit: boolean) => set({ isEdit }),
  selectedId: null,
  selectedBlock: id =>
    set({
      selectedId: id,
    }),
  activeTab: null,
  setActiveTab: (tab: 'text' | 'image' | 'diagram' | null) =>
    set({ activeTab: tab }),
});
