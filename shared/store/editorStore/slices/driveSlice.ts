import { StateCreator } from 'zustand';

import { EditorState, DriveSlice } from '@/shared/types/block';

export const createDriveSlice: StateCreator<
  EditorState,
  [],
  [],
  DriveSlice
> = set => ({
  invitationUuid: '',
  audioFolderId: '',
  imageFolderId: '',
  setInvitationUuid: (uuid: string) => set({ invitationUuid: uuid }),
  setAudioFolderId: (id: string) => set({ audioFolderId: id }),
  setImageFolderId: (id: string) => set({ imageFolderId: id }),
});
