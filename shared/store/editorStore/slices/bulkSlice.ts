import { StateCreator } from 'zustand';

import {
  BODY_BULK_DATA,
  DEFAULT_BACKGROUND_COLOR,
  TITLE_BULK_DATA,
} from '@/shared/data/sample/bulkData';
import { BulkData, BulkSlice, EditorState } from '@/shared/types/block';

export const createBulkSlice: StateCreator<EditorState, [], [], BulkSlice> = (
  set,
  _
) => ({
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  titleData: TITLE_BULK_DATA,
  bodyData: BODY_BULK_DATA,
  isZoom: false,
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  setTitleData: (data: BulkData) => set({ titleData: data }),
  setBodyData: (data: BulkData) => set({ bodyData: data }),
  setIsZoom: (isZoom: boolean) => set({ isZoom }),
});
