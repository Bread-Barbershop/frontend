import { StateCreator } from 'zustand';

import { BulkData, BulkSlice, EditorState } from '@/shared/types/block';

export const createBulkSlice: StateCreator<EditorState, [], [], BulkSlice> = (
  set,
  _
) => ({
  backgroundColor: '#FFFFFF',
  isEngTitle: true,
  titleData: {
    font: '',
    fontSize: '14px',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    isDefault: true,
  },
  bodyData: {
    font: '',
    fontSize: '14px',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
    isDefault: true,
  },
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  setEngTitle: (isEngTitle: boolean) => set({ isEngTitle }),
  setTitleData: (data: BulkData) => set({ titleData: data }),
  setBodyData: (data: BulkData) => set({ bodyData: data }),
});
