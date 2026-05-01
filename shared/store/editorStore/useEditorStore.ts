import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { EditorState } from '@/shared/types/block';

import { createBlockSlice } from './slices/blockSlice';
import { createBulkSlice } from './slices/bulkSlice';
import { createDriveSlice } from './slices/driveSlice';
import { createImageSlice } from './slices/imageSlice';
import { createUISlice } from './slices/uiSlice';

export const useEditorStore = create<EditorState>()(
  devtools((...a) => {
    const [set] = a;
    return {
      ...createBlockSlice(...a),
      ...createImageSlice(...a),
      ...createUISlice(...a),
      ...createDriveSlice(...a),
      ...createBulkSlice(...a),
      reset: () =>
        set({
          block: [],
          images: [],
          isEdit: false,
          selectedId: null,
          activeTab: null,
          drawingConfig: { width: 5, color: '#000000' },
          invitationFolderId: '',
          invitationUuid: '',
          audioFolderId: '',
          imageFolderId: '',
          backgroundColor: '#FFFFFF',
          titleData: TITLE_BULK_DATA,
          bodyData: BODY_BULK_DATA,
        }),
    };
  })
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
