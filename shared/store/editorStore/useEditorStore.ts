import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createBlockSlice } from './slices/blockSlice';
import { createImageSlice } from './slices/imageSlice';
import { createUISlice } from './slices/uiSlice';
import { EditorState } from './types';

export const useEditorStore = create<EditorState>()(
  devtools((...a) => ({
    ...createBlockSlice(...a),
    ...createImageSlice(...a),
    ...createUISlice(...a),
  }))
);
