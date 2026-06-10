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
  setActiveTab: (
    tab:
      | 'text'
      | 'image'
      | 'template'
      | 'slot'
      | 'graphic'
      | 'background'
      | 'shape'
      | null
  ) =>
    set({ activeTab: tab }),
  drawingConfig: {
    width: 5,
    color: {
      h: 0,
      s: 0,
      v: 0,
      a: 1,
    },
  },
  setDrawingConfig: config =>
    set(state => ({
      drawingConfig: { ...state.drawingConfig, ...config },
    })),
  shapeConfig: {
    strokeWidth: 2,
    strokeColor: { h: 0, s: 0, v: 0, a: 1 },
    fillColor: { h: 0, s: 0, v: 0, a: 0 },
  },
  setShapeConfig: config =>
    set(state => ({
      shapeConfig: { ...state.shapeConfig, ...config },
    })),
});
