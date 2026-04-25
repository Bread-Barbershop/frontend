import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { EditorState } from '@/shared/types/block';

import { createBlockSlice } from './slices/blockSlice';
import { createBulkSlice } from './slices/bulkSlice';
import { createDriveSlice } from './slices/driveSlice';
import { createImageSlice } from './slices/imageSlice';
import { createUISlice } from './slices/uiSlice';

export const useEditorStore = create<EditorState>()(
  devtools((...a) => ({
    ...createBlockSlice(...a),
    ...createImageSlice(...a),
    ...createUISlice(...a),
    ...createDriveSlice(...a),
    ...createBulkSlice(...a),
  }))
);

export const selectUploadData = (state: EditorState) => ({
  images: state.images,
  block: state.block,
  invitationUuid: state.invitationUuid,
  imageFolderId: state.imageFolderId,
  audioFolderId: state.audioFolderId,
  backgroundColor: state.backgroundColor,
  titleData: state.titleData,
  bodyData: state.bodyData,
  setInvitationFolderId: state.setInvitationFolderId,
  setInvitationUuid: state.setInvitationUuid,
  setImageFolderId: state.setImageFolderId,
  setAudioFolderId: state.setAudioFolderId,
});
