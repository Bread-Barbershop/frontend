import { StateCreator } from 'zustand';

import { EditorState, DriveSlice } from '@/shared/types/block';

export const createDriveSlice: StateCreator<
  EditorState,
  [],
  [],
  DriveSlice
> = set => ({
  invitationFolderId: '',
  invitationUuid: '',
  audioFolderId: '',
  imageFolderId: '',
  setInvitationFolderId: (id: string) => set({ invitationFolderId: id }),
  setInvitationUuid: (uuid: string) => set({ invitationUuid: uuid }),
  setAudioFolderId: (id: string) => set({ audioFolderId: id }),
  setImageFolderId: (id: string) => set({ imageFolderId: id }),
});
