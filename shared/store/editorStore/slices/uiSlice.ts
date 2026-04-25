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
  setActiveTab: (tab: 'text' | 'image' | 'diagram' | 'background' | null) =>
    set({ activeTab: tab }),
  drawingConfig: {
    width: 5,
    color: '#000000',
  },
  setDrawingConfig: config =>
    set(state => ({
      drawingConfig: { ...state.drawingConfig, ...config },
    })),
});
