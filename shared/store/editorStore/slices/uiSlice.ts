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
  activeTab: 'background',
  setActiveTab: (tab: 'text' | 'image' | 'diagram' | 'background') =>
    set({ activeTab: tab }),
});
