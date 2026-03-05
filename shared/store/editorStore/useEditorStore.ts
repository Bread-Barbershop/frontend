import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { EditorState } from '@/shared/types/block';

import { createBlockSlice } from './slices/blockSlice';
import { createDriveSlice } from './slices/driveSlice';
import { createImageSlice } from './slices/imageSlice';
import { createUISlice } from './slices/uiSlice';

export const useEditorStore = create<EditorState>()(
  devtools((...a) => ({
    ...createBlockSlice(...a),
    ...createImageSlice(...a),
    ...createUISlice(...a),
    ...createDriveSlice(...a),
  }))
);
