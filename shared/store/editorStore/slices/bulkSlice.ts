import { StateCreator } from 'zustand';

import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { BulkData, BulkSlice, EditorState } from '@/shared/types/block';

export const createBulkSlice: StateCreator<EditorState, [], [], BulkSlice> = (
  set,
  _
) => ({
  backgroundColor: '#FFFFFF',
  titleData: TITLE_BULK_DATA,
  bodyData: BODY_BULK_DATA,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  setTitleData: (data: BulkData) => set({ titleData: data }),
  setBodyData: (data: BulkData) => set({ bodyData: data }),
});
